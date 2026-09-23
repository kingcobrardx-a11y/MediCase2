"""Services package for MediCase AI.

Contains the central LLM integration service and dedicated clinical workflows:
- followup_service: Adaptive follow-up question generation
- summary_service: Hallucination-free structured case summarization
- redflag_service: Non-diagnostic clinical red flag triage detection
"""

from app.services.ai_service import ai_service
from app.services.followup_service import generate_followup_questions
from app.services.summary_service import generate_case_summary
from app.services.redflag_service import detect_red_flags

__all__ = [
    "ai_service",
    "generate_followup_questions",
    "generate_case_summary",
    "detect_red_flags",
]
