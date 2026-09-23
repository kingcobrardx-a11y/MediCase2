"""Pydantic data models for MediCase AI requests and responses.

Strictly adheres to clinical safety guidelines: no diagnoses or prescriptions.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ==============================================================================
# Feature 1: Adaptive Follow-Up Questions Schemas
# ==============================================================================

class FollowUpRequest(BaseModel):
    """Input payload for generating adaptive clinical follow-up questions."""
    chief_complaint: str = Field(
        ...,
        description="The primary reason for the patient's visit (e.g. 'Headache', 'Abdominal pain').",
        examples=["Headache"]
    )
    symptoms: List[str] = Field(
        default_factory=list,
        description="List of symptoms reported by the patient.",
        examples=[["headache", "nausea"]]
    )
    duration: Optional[str] = Field(
        default=None,
        description="Duration of the complaint (e.g., '2 days', '30 minutes').",
        examples=["2 days"]
    )
    severity: Optional[int] = Field(
        default=None,
        ge=1,
        le=10,
        description="Self-reported pain/severity score on a scale from 1 to 10.",
        examples=[7]
    )
    medical_history: Optional[List[str]] = Field(
        default_factory=list,
        description="Known pre-existing medical conditions (e.g. 'Hypertension', 'Asthma').",
        examples=[[]]
    )
    medications: Optional[List[str]] = Field(
        default_factory=list,
        description="Current medications being taken by the patient.",
        examples=[[]]
    )
    language: Optional[str] = Field(
        default="en",
        description="Preferred language for follow-up questions ('en' for English, 'hi' for Hindi).",
        examples=["en"]
    )


class FollowUpResponse(BaseModel):
    """Structured response containing context-aware follow-up questions."""
    questions: List[str] = Field(
        ...,
        description="List of targeted, context-aware follow-up questions.",
        examples=[[
            "Where exactly is the headache located?",
            "How severe is the headache from 1 to 10?",
            "Do you have sensitivity to light?",
            "Have you experienced vomiting?",
            "Have you had similar headaches before?"
        ]]
    )


# ==============================================================================
# Feature 2: Structured Case Summary Schemas
# ==============================================================================

class CaseSummaryRequest(BaseModel):
    """Input payload for generating a factual case summary."""
    chief_complaint: str = Field(
        ...,
        description="The primary reason for the patient's visit.",
        examples=["Headache"]
    )
    symptoms: List[str] = Field(
        default_factory=list,
        description="List of initial symptoms reported.",
        examples=[["headache", "nausea"]]
    )
    duration: Optional[str] = Field(
        default=None,
        description="Duration of the complaint.",
        examples=["2 days"]
    )
    severity: Optional[int] = Field(
        default=None,
        ge=1,
        le=10,
        description="Pain/severity score (1-10).",
        examples=[7]
    )
    answers: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Patient's responses to follow-up questions.",
        examples=[{
            "location": "Right side",
            "vomiting": "No",
            "light_sensitivity": "Yes"
        }]
    )
    medical_history: Optional[List[str]] = Field(
        default_factory=list,
        description="Patient's confirmed past medical history.",
        examples=[[]]
    )
    medications: Optional[List[str]] = Field(
        default_factory=list,
        description="Patient's current medications.",
        examples=[[]]
    )
    language: Optional[str] = Field(
        default="en",
        description="Language for summary ('en' or 'hi').",
        examples=["en"]
    )


class CaseSummaryResponse(BaseModel):
    """Factual, structured case summary strictly based on provided patient facts."""
    summary: str = Field(
        ...,
        description="Concise, synthesized clinical summary of the patient's case.",
        examples=["Patient reports right-sided headache for 2 days with severity 7/10 and associated nausea and light sensitivity."]
    )
    key_symptoms: List[str] = Field(
        ...,
        description="Extracted key symptoms from the complaint and answers.",
        examples=[["headache", "nausea", "light sensitivity"]]
    )
    duration: Optional[str] = Field(
        default=None,
        description="Reported duration of symptoms.",
        examples=["2 days"]
    )
    severity: Optional[int] = Field(
        default=None,
        description="Reported severity score.",
        examples=[7]
    )
    disclaimer: str = Field(
        default="Assistive case summary prepared for doctor review. AI is not a doctor and does not diagnose or prescribe.",
        description="Clinical decision support disclaimer."
    )


# ==============================================================================
# Feature 3: Red Flag Detection Schemas
# ==============================================================================

class RedFlagItem(BaseModel):
    """A detected clinical red flag requiring physician review."""
    flag: str = Field(
        ...,
        description="Short title of the detected red flag.",
        examples=["Breathing difficulty"]
    )
    severity: str = Field(
        ...,
        description="Severity level ('critical', 'high', 'moderate').",
        examples=["high"]
    )
    reason: str = Field(
        ...,
        description="Clinical rationale using non-diagnostic, cautious triage language.",
        examples=["Patient reported difficulty breathing. Requires urgent clinical assessment."]
    )
    requires_doctor_review: bool = Field(
        default=True,
        description="Whether a physician must review this immediately."
    )


class RedFlagRequest(BaseModel):
    """Input payload for clinical red flag detection."""
    chief_complaint: str = Field(
        ...,
        description="Primary chief complaint.",
        examples=["Chest pain"]
    )
    symptoms: List[str] = Field(
        default_factory=list,
        description="List of symptoms reported.",
        examples=[["chest pain", "breathing difficulty"]]
    )
    duration: Optional[str] = Field(
        default=None,
        description="Duration of symptoms.",
        examples=["30 minutes"]
    )
    severity: Optional[int] = Field(
        default=None,
        description="Severity score (1-10).",
        examples=[8]
    )
    answers: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Any answers provided to follow-up questions."
    )
    medical_history: Optional[List[str]] = Field(
        default_factory=list,
        description="Past medical conditions."
    )


class RedFlagResponse(BaseModel):
    """Response containing flagged concerns for doctor review."""
    red_flags: List[RedFlagItem] = Field(
        default_factory=list,
        description="List of identified red flags."
    )
    requires_doctor_review: bool = Field(
        ...,
        description="True if any red flags or elevated severity were detected.",
        examples=[True]
    )


# ==============================================================================
# Combined Intake Analysis Schemas
# ==============================================================================

class CombinedCaseRequest(BaseModel):
    """Input payload for full case-taking analysis."""
    chief_complaint: str
    symptoms: List[str] = Field(default_factory=list)
    duration: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=10)
    answers: Optional[Dict[str, Any]] = Field(default_factory=dict)
    medical_history: Optional[List[str]] = Field(default_factory=list)
    medications: Optional[List[str]] = Field(default_factory=list)
    language: Optional[str] = "en"


class CombinedCaseResponse(BaseModel):
    """Combined response delivering follow-up questions, summary, and red flags."""
    follow_up_questions: List[str]
    summary: Optional[CaseSummaryResponse] = None
    red_flags: RedFlagResponse
    disclaimer: str = "Assistive case-taking report for doctor review only. MediCase AI does not diagnose diseases or prescribe medications."
