"""Service for clinical red flag detection and triage alerting.

Strictly enforces non-diagnostic, cautious clinical language for doctor review.
"""

import re
from typing import Any, Dict, List

from app.prompts.redflag_prompt import (
    REDFLAG_SYSTEM_PROMPT,
    build_redflag_user_prompt,
)
from app.schemas.ai_schemas import RedFlagItem, RedFlagRequest, RedFlagResponse
from app.services.ai_service import ai_service


def _cleanse_diagnostic_language(text: str) -> str:
    """Safety guardrail: rewrites any inadvertent diagnostic assertions into cautious triage language."""
    # List of prohibited direct diagnosis phrasing patterns
    prohibited_replacements = [
        (r"(?i)\byou have a heart attack\b", "Potential cardiac red flag identified"),
        (r"(?i)\byou have a stroke\b", "Potential acute neurological red flag identified"),
        (r"(?i)\byou have meningitis\b", "Concerning acute febrile/neurological presentation"),
        (r"(?i)\byou have appendicitis\b", "Potential acute abdominal indicator"),
        (r"(?i)\bpatient has\s+(a\s+)?(heart attack|myocardial infarction|stroke|meningitis|appendicitis|pneumonia)\b",
         r"Reported symptoms concerning for acute \2 requiring assessment"),
        (r"(?i)\bdiagnosis is\b", "Clinical presentation warrants review for"),
    ]
    cleaned = text
    for pattern, replacement in prohibited_replacements:
        cleaned = re.sub(pattern, replacement, cleaned)
    return cleaned


def _detect_heuristic_red_flags(data: RedFlagRequest) -> Dict[str, Any]:
    """Clinical heuristic triage engine detecting high-risk warning signs."""
    flags: List[Dict[str, Any]] = []

    text_corpus = f"{data.chief_complaint} {' '.join(data.symptoms)}".lower()
    answers = data.answers or {}
    for k, v in answers.items():
        text_corpus += f" {k} {v}".lower()

    # 1. Breathing difficulty / Dyspnea
    if any(k in text_corpus for k in ["breathing difficulty", "shortness of breath", "breathless", "dyspnea", "stridor", "सांस"]):
        flags.append({
            "flag": "Breathing difficulty",
            "severity": "high",
            "reason": "Patient reported difficulty breathing. Requires urgent clinical assessment.",
            "requires_doctor_review": True,
        })

    # 2. Chest pain / Acute Coronary Syndrome indicators
    if any(k in text_corpus for k in ["chest pain", "chest tightness", "chest pressure", "छाती में दर्द", "सीने में दर्द"]):
        is_severe = (data.severity or 0) >= 7
        radiating = any(k in text_corpus for k in ["arm", "jaw", "neck", "back", "left shoulder"])
        
        reason = "Potential red flag identified: acute chest discomfort"
        if radiating:
            reason += " with reported radiation"
        if is_severe:
            reason += " and elevated pain score"
        reason += ". Requires urgent doctor review."

        flags.append({
            "flag": "Acute chest discomfort",
            "severity": "critical" if (is_severe or radiating) else "high",
            "reason": reason,
            "requires_doctor_review": True,
        })

    # 3. Neurological red flags (thunderclap headache, sudden weakness, speech changes)
    if any(k in text_corpus for k in ["thunderclap", "worst headache", "slurred speech", "facial droop", "loss of consciousness", "seizure", "paralysis"]):
        flags.append({
            "flag": "Acute neurological signs",
            "severity": "critical",
            "reason": "Potential red flag identified: acute neurological indicators reported. Requires emergency clinical evaluation.",
            "requires_doctor_review": True,
        })
    elif any(k in text_corpus for k in ["headache", "सिरदर्द"]) and (data.severity or 0) >= 8:
        flags.append({
            "flag": "High-intensity headache",
            "severity": "high",
            "reason": "Potential red flag: severe headache (severity >= 8/10). Needs prompt clinical assessment.",
            "requires_doctor_review": True,
        })

    # 4. Severe gastrointestinal / acute abdomen alarms
    if any(k in text_corpus for k in ["vomiting blood", "hematemesis", "black stool", "melena", "rigid abdomen", "severe belly pain"]):
        flags.append({
            "flag": "Concerning gastrointestinal indicator",
            "severity": "high",
            "reason": "Potential red flag identified: gastrointestinal alarm symptoms reported. Requires urgent doctor review.",
            "requires_doctor_review": True,
        })

    # 5. Elevated pain score alone (8-10)
    if (data.severity or 0) >= 8 and not any(f["flag"] == "High-intensity headache" for f in flags):
        flags.append({
            "flag": f"High pain severity ({data.severity}/10)",
            "severity": "high",
            "reason": f"Patient reported a severe pain level of {data.severity}/10. Requires priority physician evaluation.",
            "requires_doctor_review": True,
        })

    return {
        "red_flags": flags,
        "requires_doctor_review": len(flags) > 0,
    }


async def detect_red_flags(data: RedFlagRequest) -> RedFlagResponse:
    """Detects concerning clinical red flags using cautious, non-diagnostic triage standards."""
    system_prompt = REDFLAG_SYSTEM_PROMPT
    user_prompt = build_redflag_user_prompt(
        chief_complaint=data.chief_complaint,
        symptoms=data.symptoms,
        duration=data.duration,
        severity=data.severity,
        answers=data.answers,
        medical_history=data.medical_history,
    )

    fallback_fn = lambda: _detect_heuristic_red_flags(data)

    result = await ai_service.generate_json(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        fallback_fn=fallback_fn,
    )

    raw_flags = result.get("red_flags", [])
    if not isinstance(raw_flags, list):
        raw_flags = _detect_heuristic_red_flags(data)["red_flags"]

    items: List[RedFlagItem] = []
    for item in raw_flags:
        if isinstance(item, dict) and "flag" in item and "reason" in item:
            # Apply safety guardrail to reason text
            cleaned_reason = _cleanse_diagnostic_language(str(item["reason"]))
            items.append(
                RedFlagItem(
                    flag=str(item["flag"]),
                    severity=str(item.get("severity", "high")),
                    reason=cleaned_reason,
                    requires_doctor_review=bool(item.get("requires_doctor_review", True)),
                )
            )

    # If LLM returned empty list but heuristics detect obvious critical signs, merge them
    if not items:
        heuristic_res = _detect_heuristic_red_flags(data)
        if heuristic_res["red_flags"]:
            for h in heuristic_res["red_flags"]:
                items.append(RedFlagItem(**h))

    requires_review = len(items) > 0 or bool(result.get("requires_doctor_review", False))

    return RedFlagResponse(
        red_flags=items,
        requires_doctor_review=requires_review,
    )
