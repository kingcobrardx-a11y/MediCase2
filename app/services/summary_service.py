"""Service for generating faithful, structured patient case summaries for doctor review."""

from typing import Any, Dict, List

from app.prompts.summary_prompt import (
    SUMMARY_SYSTEM_PROMPT,
    build_summary_user_prompt,
)
from app.schemas.ai_schemas import CaseSummaryRequest, CaseSummaryResponse
from app.services.ai_service import ai_service


def _generate_heuristic_summary(data: CaseSummaryRequest) -> Dict[str, Any]:
    """Clinical heuristic synthesizer constructing a faithful, hallucination-free summary."""
    parts: List[str] = []

    # 1. Location or complaint opening
    answers = data.answers or {}
    location = answers.get("location") or answers.get("site") or ""
    
    opening = "Patient presents with "
    if location and str(location).lower() not in ("no", "none", "unknown"):
        opening += f"{location} "
    opening += f"{data.chief_complaint.lower()}"
    
    if data.duration:
        opening += f" for {data.duration}"
    if data.severity is not None:
        opening += f" with reported severity of {data.severity}/10"
    opening += "."
    parts.append(opening)

    # 2. Associated reported symptoms
    key_symptoms_set = set(s.strip().lower() for s in data.symptoms if s.strip())
    
    positives = []
    negatives = []
    
    for k, v in answers.items():
        v_str = str(v).strip().lower()
        readable_key = k.replace("_", " ").strip()
        if readable_key in ("location", "site"):
            continue
            
        if v_str in ("yes", "true", "positive", "present"):
            positives.append(readable_key)
            key_symptoms_set.add(readable_key)
        elif v_str in ("no", "false", "negative", "absent", "denied"):
            negatives.append(readable_key)
        elif v_str and v_str not in ("none", "n/a", "not specified"):
            positives.append(f"{readable_key} ({v})")
            key_symptoms_set.add(readable_key)

    if positives:
        parts.append(f"Associated symptoms include: {', '.join(positives)}.")
    if negatives:
        parts.append(f"Patient denies: {', '.join(negatives)}.")

    # 3. Medical history and medications (only if explicitly reported)
    if data.medical_history:
        parts.append(f"Past medical history: {', '.join(data.medical_history)}.")
    if data.medications:
        parts.append(f"Current medications: {', '.join(data.medications)}.")

    summary_text = " ".join(parts)

    return {
        "summary": summary_text,
        "key_symptoms": sorted(list(key_symptoms_set)),
        "duration": data.duration,
        "severity": data.severity,
    }


async def generate_case_summary(data: CaseSummaryRequest) -> CaseSummaryResponse:
    """Generates a structured clinical case summary strictly adhering to reported facts."""
    system_prompt = SUMMARY_SYSTEM_PROMPT
    user_prompt = build_summary_user_prompt(
        chief_complaint=data.chief_complaint,
        symptoms=data.symptoms,
        duration=data.duration,
        severity=data.severity,
        answers=data.answers,
        medical_history=data.medical_history,
        medications=data.medications,
        language=data.language,
    )

    fallback_fn = lambda: _generate_heuristic_summary(data)

    result = await ai_service.generate_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        fallback_fn=fallback_fn,
    )

    summary_text = result.get("summary")
    if not summary_text or not isinstance(summary_text, str):
        heuristic = _generate_heuristic_summary(data)
        summary_text = heuristic["summary"]

    key_symptoms = result.get("key_symptoms")
    if not isinstance(key_symptoms, list):
        key_symptoms = _generate_heuristic_summary(data)["key_symptoms"]
    key_symptoms = [str(s).strip() for s in key_symptoms if str(s).strip()]

    duration_val = result.get("duration") or data.duration
    severity_val = result.get("severity") if result.get("severity") is not None else data.severity

    return CaseSummaryResponse(
        summary=summary_text.strip(),
        key_symptoms=key_symptoms,
        duration=duration_val,
        severity=severity_val,
    )
