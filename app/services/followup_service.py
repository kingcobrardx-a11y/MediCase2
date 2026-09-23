"""Service for generating context-aware, adaptive clinical follow-up questions."""

import re
from typing import Any, Dict, List

from app.prompts.followup_prompt import (
    FOLLOWUP_SYSTEM_PROMPT,
    build_followup_user_prompt,
)
from app.schemas.ai_schemas import FollowUpRequest, FollowUpResponse
from app.services.ai_service import ai_service


def _is_hindi(text: str, language_code: str = "en") -> bool:
    """Detects if language requested or input text contains Devanagari script."""
    if language_code.lower() in ("hi", "hindi"):
        return True
    return bool(re.search(r"[\u0900-\u097F]", text))


def _generate_heuristic_followup(data: FollowUpRequest) -> Dict[str, Any]:
    """Clinical heuristic engine generating tailored, context-specific questions.

    Ensures high-fidelity, medically sound questions even when offline or in mock mode.
    """
    text_corpus = f"{data.chief_complaint} {' '.join(data.symptoms)}".lower()
    is_hi = _is_hindi(text_corpus, data.language or "en")

    questions: List[str] = []

    # 1. Headache Domain
    if any(k in text_corpus for k in ["headache", "head pain", "migraine", "सिर दर्द", "सिरदर्द"]):
        if is_hi:
            questions = [
                "सिर में दर्द किस तरफ या किस जगह पर सबसे ज़्यादा महसूस हो रहा है?",
                "दर्द की तीव्रता 1 से 10 के पैमाने पर कितनी है?",
                "क्या आपको तेज़ रोशनी (light) या तेज़ आवाज़ से परेशानी हो रही है?",
                "क्या आपको उल्टी (vomiting) या जी मिचलाने जैसा महसूस हुआ है?",
                "क्या यह सिरदर्द अचानक बहुत तेज़ी से शुरू हुआ, या धीरे-धीरे बढ़ा?",
                "क्या आपको पहले भी इस तरह के सिरदर्द के दौरे पड़े हैं?"
            ]
        else:
            has_nausea = any("nausea" in s.lower() for s in data.symptoms)
            questions = [
                "Where exactly is the headache located (e.g., forehead, one side, back of head)?",
                f"How would you rate the severity of the headache right now from 1 to 10? (Reported: {data.severity or 'unrated'})",
                "Do you experience increased sensitivity to light or sound?",
                "Have you experienced vomiting or dizziness?" if has_nausea else "Have you experienced any nausea or vomiting?",
                "Did this headache start suddenly ('like a thunderclap') or develop gradually?",
                "Have you had similar headaches or migraine episodes in the past?"
            ]

    # 2. Abdominal Pain Domain
    elif any(k in text_corpus for k in ["abdominal", "stomach", "belly", "tummy", "पेट दर्द", "पेट"]):
        if is_hi:
            questions = [
                "पेट में दर्द किस हिस्से में हो रहा है (ऊपरी, निचला, दायां या बायां हिस्सा)?",
                "दर्द का प्रकार कैसा है — ऐंठन, मरोड़ या लगातार चुभन जैसा?",
                "क्या खाना खाने से दर्द बढ़ता है या कम होता है?",
                "क्या आपको उल्टी, दस्त या कब्ज की शिकायत है?",
                "क्या आपको बुखार या ठंड लगने जैसा महसूस हुआ है?",
                "क्या पेशाब करते समय जलन या दर्द का अनुभव हो रहा है?"
            ]
        else:
            questions = [
                "Where exactly in the abdomen is the pain located (upper, lower, right side, or left side)?",
                "How would you describe the pain — is it cramping, burning, sharp, or a dull ache?",
                "Does eating food make the pain better, worse, or have no effect?",
                "Have you noticed any changes in your bowel movements (such as diarrhea, constipation, or dark stools)?",
                "Have you experienced any nausea, vomiting, or fever?",
                "Does the pain radiate to your back, chest, or groin?"
            ]

    # 3. Chest Pain Domain
    elif any(k in text_corpus for k in ["chest", "छाती", "सीने में दर्द", "सीने"]):
        if is_hi:
            questions = [
                "सीने में दर्द किस जगह पर है, और क्या यह बाएं हाथ, जबड़े या पीठ की तरफ फैलता है?",
                "दर्द का अहसास कैसा है — भारीपन, दबाव, या चुभन जैसा?",
                "क्या चलने या मेहनत करने पर दर्द बढ़ जाता है?",
                "क्या आपको सांस लेने में तकलीफ या घबराहट हो रही है?",
                "क्या आपको अचानक ठंडा पसीना या चक्कर आने का अनुभव हुआ है?"
            ]
        else:
            questions = [
                "Where in your chest is the pain located, and does it spread to your left arm, jaw, neck, or back?",
                "How would you describe the feeling — is it a crushing tightness/pressure, aching, or sharp on breathing?",
                "Does walking, climbing stairs, or physical exertion trigger or worsen the pain?",
                "Are you experiencing any shortness of breath or sweating with the discomfort?",
                "Did this pain begin suddenly while resting or during activity?"
            ]

    # 4. Respiratory / Cough Domain
    elif any(k in text_corpus for k in ["cough", "breath", "wheez", "खांसी", "सांस"]):
        if is_hi:
            questions = [
                "क्या खांसी सूखी है या बलगम (phlegm) आ रहा है? यदि बलगम है तो उसका रंग क्या है?",
                "क्या आपको आराम करते समय या लेटने पर भी सांस लेने में कठिनाई होती है?",
                "क्या सांस लेते समय छाती से सीटी जैसी आवाज (wheezing) आती है?",
                "क्या आपको बुखार, गले में खराश या ठंड लग रही है?",
                "क्या आप वर्तमान में किसी एलर्जी या अस्थमा (asthma) के लिए इनहेलर का उपयोग करते हैं?"
            ]
        else:
            questions = [
                "Is your cough dry, or are you bringing up phlegm/mucus? If so, what color is it?",
                "Are you experiencing shortness of breath at rest, or only during physical activity?",
                "Have you noticed any wheezing or whistling sound when you breathe?",
                "Have you had fever, chills, or night sweats alongside the cough?",
                "Do you have a personal or family history of asthma or respiratory allergies?"
            ]

    # 5. Fever / Infection Domain
    elif any(k in text_corpus for k in ["fever", "temperature", "chills", "बुखार"]):
        if is_hi:
            questions = [
                "क्या आपने थर्मामीटर से तापमान नापा है? अधिकतम बुखार कितना दर्ज हुआ?",
                "क्या बुखार के साथ कंपकंपी (chills) या अत्यधिक पसीना आता है?",
                "क्या आपको गले में दर्द, खांसी या सिरदर्द की समस्या है?",
                "क्या शरीर पर कोई दाने या चकत्ते (rash) दिखाई दिए हैं?",
                "क्या पेशाब में जलन या पेशाब करने की इच्छा बार-बार हो रही है?"
            ]
        else:
            questions = [
                "Have you measured your body temperature with a thermometer, and what was the highest reading?",
                "Does the fever come with shivering/chills, or does it stay continuous throughout the day?",
                "Do you have accompanying symptoms such as sore throat, cough, or body aches?",
                "Have you noticed any skin rash or joint swellings?",
                "Have you traveled recently or been around anyone who was sick?"
            ]

    # 6. Joint / Musculoskeletal Pain Domain
    elif any(k in text_corpus for k in ["joint", "knee", "back", "muscle", "कमर दर्द", "जोड़ों"]):
        if is_hi:
            questions = [
                "किस जोड़ या शरीर के किस हिस्से में दर्द सबसे अधिक है?",
                "क्या दर्द वाले हिस्से में सूजन, लालिमा या गर्माहट महसूस हो रही है?",
                "क्या हाल ही में कोई चोट, खिंचाव या भारी वजन उठाने की घटना हुई थी?",
                "क्या सुबह उठने पर जोड़ों में जकड़न महसूस होती है?",
                "क्या चलने-फिरने या आराम करने से दर्द में कोई आराम मिलता है?"
            ]
        else:
            questions = [
                "Which specific joint or back area is affected, and does the pain travel down your legs or arms?",
                "Have you noticed any visible swelling, redness, or warmth in the painful area?",
                "Was there an injury, twist, fall, or heavy lifting incident preceding the pain?",
                "Do you feel noticeable joint stiffness in the morning, and how long does it last?",
                "Does rest improve the pain, or does gentle movement help ease it?"
            ]

    # 7. General Clinical Fallback
    else:
        if is_hi:
            questions = [
                "यह परेशानी सबसे पहले कब और कैसे शुरू हुई?",
                "क्या इस समस्या से पहले आपने कोई नया भोजन या नई दवा ली थी?",
                "क्या कोई ऐसी स्थिति या काम है जिससे इस तकलीफ में आराम या बढ़ोतरी होती है?",
                "क्या आपको इसके साथ कोई अन्य लक्षण जैसे चक्कर आना, कमजोरी या मतली महसूस हो रही है?",
                "क्या आपको पहले कभी ऐसी कोई तकलीफ हुई है?"
            ]
        else:
            questions = [
                "Could you describe exactly when and how this complaint first began?",
                "Has the symptom been constant, or does it come and go in episodes?",
                "Is there anything specific that seems to make the discomfort better or worse?",
                "Have you noticed any related symptoms such as dizziness, fatigue, or nausea?",
                "Have you ever experienced a similar episode in the past?"
            ]

    return {"questions": questions}


async def generate_followup_questions(data: FollowUpRequest) -> FollowUpResponse:
    """Generates context-aware, patient-friendly follow-up questions.

    Uses live Gemini LLM if configured; otherwise seamlessly uses clinical heuristic generator.
    """
    system_prompt = FOLLOWUP_SYSTEM_PROMPT
    user_prompt = build_followup_user_prompt(
        chief_complaint=data.chief_complaint,
        symptoms=data.symptoms,
        duration=data.duration,
        severity=data.severity,
        medical_history=data.medical_history,
        medications=data.medications,
        language=data.language,
    )

    fallback_fn = lambda: _generate_heuristic_followup(data)

    result = await ai_service.generate_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        fallback_fn=fallback_fn,
    )

    # Ensure questions list is properly populated
    raw_questions = result.get("questions", [])
    if not isinstance(raw_questions, list) or not raw_questions:
        raw_questions = _generate_heuristic_followup(data)["questions"]

    # Filter any non-string entries
    clean_questions = [str(q).strip() for q in raw_questions if str(q).strip()]

    return FollowUpResponse(questions=clean_questions)
