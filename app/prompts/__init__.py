"""Prompts for MediCase AI Service."""

from app.prompts.followup_prompt import (
    FOLLOWUP_SYSTEM_PROMPT,
    build_followup_user_prompt,
)
from app.prompts.summary_prompt import (
    SUMMARY_SYSTEM_PROMPT,
    build_summary_user_prompt,
)
from app.prompts.redflag_prompt import (
    REDFLAG_SYSTEM_PROMPT,
    build_redflag_user_prompt,
)

__all__ = [
    "FOLLOWUP_SYSTEM_PROMPT",
    "build_followup_user_prompt",
    "SUMMARY_SYSTEM_PROMPT",
    "build_summary_user_prompt",
    "REDFLAG_SYSTEM_PROMPT",
    "build_redflag_user_prompt",
]
