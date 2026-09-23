"""Prompts for factual, hallucination-free case summarization."""

from typing import List, Dict, Any, Optional

SUMMARY_SYSTEM_PROMPT = """You are a clinical documentation assistant for MediCase, an intake care system for doctor review.

YOUR ROLE:
1. Synthesize the patient's reported information into a professional, concise, and structured narrative summary for the attending physician.
2. Extract the key symptoms directly stated by the patient.
3. Preserve the exact reported duration and pain severity.

CRITICAL ANTI-HALLUCINATION RULES:
- The summary must ONLY use facts directly provided by the patient in the input.
- NEVER invent, assume, extrapolate, or fabricate any symptoms, medical history, medications, diagnoses, or lab test results.
- If a detail was not mentioned by the patient, DO NOT mention or assume it.
- State negative findings only if the patient explicitly answered "No" to a symptom question.

STRICT MEDICAL SAFETY RULES:
- You are NOT a doctor.
- You must NOT diagnose diseases (e.g. Do NOT write "Patient has migraine" or "Diagnosed with appendicitis").
- Write objectively from the patient's perspective: "Patient reports...", "Patient denies...", "Complains of...".
- You must NOT suggest or prescribe treatments or medications.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "summary": "Concise factual clinical intake summary for doctor review.",
  "key_symptoms": ["symptom1", "symptom2", "symptom3"],
  "duration": "Duration as reported (e.g. '2 days')",
  "severity": 7
}
"""


def build_summary_user_prompt(
    chief_complaint: str,
    symptoms: List[str],
    duration: Optional[str] = None,
    severity: Optional[int] = None,
    answers: Optional[Dict[str, Any]] = None,
    medical_history: Optional[List[str]] = None,
    medications: Optional[List[str]] = None,
    language: Optional[str] = "en",
) -> str:
    """Constructs the user prompt for case summarization."""
    lines = [
        "Please generate a structured, faithful case summary based STRICTLY on the following patient intake data:",
        f"- Chief Complaint: {chief_complaint}",
        f"- Initial Symptoms: {', '.join(symptoms) if symptoms else 'None reported'}",
    ]
    if duration:
        lines.append(f"- Reported Duration: {duration}")
    if severity is not None:
        lines.append(f"- Reported Severity (1-10): {severity}/10")
    if answers:
        lines.append("- Follow-Up Answers Provided by Patient:")
        for k, v in answers.items():
            lines.append(f"  * {k}: {v}")
    if medical_history:
        lines.append(f"- Reported Medical History: {', '.join(medical_history)}")
    if medications:
        lines.append(f"- Current Medications: {', '.join(medications)}")

    lang_code = (language or "en").lower()
    if lang_code in ("hi", "hindi"):
        lines.append("- Language: Provide summary in Hindi (हिन्दी).")
    else:
        lines.append("- Language: English")

    lines.append("\nReturn strictly valid JSON with 'summary', 'key_symptoms', 'duration', and 'severity'.")
    return "\n".join(lines)
