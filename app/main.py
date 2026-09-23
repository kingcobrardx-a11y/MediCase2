"""MediCase AI Integration Service API.

FastAPI application providing clinical case-taking assistance:
- /ai/follow-up: Adaptive, context-aware clinical follow-up questions
- /ai/summary: Factual, structured patient case summary
- /ai/red-flags: Non-diagnostic clinical safety red-flag triage
- /ai/analyze-case: Unified assessment combining all three capabilities
- /health: Service health and configuration check
"""

import logging
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.schemas.ai_schemas import (
    CombinedCaseRequest,
    CombinedCaseResponse,
    CaseSummaryRequest,
    CaseSummaryResponse,
    FollowUpRequest,
    FollowUpResponse,
    RedFlagRequest,
    RedFlagResponse,
)
from app.services.ai_service import ai_service
from app.services.followup_service import generate_followup_questions
from app.services.redflag_service import detect_red_flags
from app.services.summary_service import generate_case_summary

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("medicase.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("==================================================")
    logger.info(" MediCase AI Service starting up")
    logger.info(f" Host: {settings.HOST}:{settings.PORT}")
    logger.info(f" Provider: {settings.LLM_PROVIDER} | Model: {settings.GEMINI_MODEL}")
    logger.info(f" Live LLM Available: {ai_service.is_live_llm_available()}")
    logger.info("==================================================")
    yield
    logger.info("MediCase AI Service shutting down.")


app = FastAPI(
    title="MediCase — AI Integration Service",
    description=(
        "Patient Case-Taking Care System AI Module. "
        "Provides adaptive follow-up questioning, factual case summarization, "
        "and non-diagnostic red flag detection for physician review. "
        "MediCase AI is an assistive intake tool and does not diagnose or prescribe."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend & backend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def root() -> Dict[str, Any]:
    """Root landing endpoint with system metadata."""
    return {
        "service": "MediCase AI Integration Service",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "disclaimer": "Assistive clinical intake software for doctor review. Does not diagnose or prescribe.",
    }


@app.get("/health", tags=["General"])
async def health_check() -> Dict[str, Any]:
    """Health check endpoint reporting runtime and LLM status."""
    return {
        "status": "healthy",
        "live_llm_active": ai_service.is_live_llm_available(),
        "provider": settings.LLM_PROVIDER,
        "model": settings.GEMINI_MODEL,
        "version": "1.0.0",
    }


# ==============================================================================
# Feature 1: Adaptive Follow-Up Questions
# ==============================================================================

@app.post(
    "/ai/follow-up",
    response_model=FollowUpResponse,
    status_code=status.HTTP_200_OK,
    tags=["Case Intake"],
    summary="Generate adaptive follow-up questions",
    description=(
        "Generates context-aware, targeted follow-up questions based on the patient's "
        "chief complaint, reported symptoms, duration, and severity. Supports English and Hindi."
    ),
)
async def followup_endpoint(payload: FollowUpRequest) -> FollowUpResponse:
    try:
        response = await generate_followup_questions(payload)
        return response
    except Exception as e:
        logger.error(f"Error generating follow-up questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate clinical follow-up questions.",
        )


# ==============================================================================
# Feature 2: Structured Case Summary
# ==============================================================================

@app.post(
    "/ai/summary",
    response_model=CaseSummaryResponse,
    status_code=status.HTTP_200_OK,
    tags=["Case Intake"],
    summary="Generate structured case summary",
    description=(
        "Synthesizes patient intake data and follow-up answers into a structured, "
        "faithful summary for doctor review without hallucinating or assuming facts."
    ),
)
async def summary_endpoint(payload: CaseSummaryRequest) -> CaseSummaryResponse:
    try:
        response = await generate_case_summary(payload)
        return response
    except Exception as e:
        logger.error(f"Error generating case summary: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate clinical case summary.",
        )


# ==============================================================================
# Feature 3: Red Flag Detection
# ==============================================================================

@app.post(
    "/ai/red-flags",
    response_model=RedFlagResponse,
    status_code=status.HTTP_200_OK,
    tags=["Clinical Safety"],
    summary="Detect clinical red flags for doctor review",
    description=(
        "Screens patient symptoms and complaint for acute danger indicators. "
        "Adheres strictly to non-diagnostic, cautious triage language for physician alerting."
    ),
)
async def redflags_endpoint(payload: RedFlagRequest) -> RedFlagResponse:
    try:
        response = await detect_red_flags(payload)
        return response
    except Exception as e:
        logger.error(f"Error detecting red flags: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze clinical red flags.",
        )


# ==============================================================================
# Combined Service Endpoint: Full Case Intake Assessment
# ==============================================================================

@app.post(
    "/ai/analyze-case",
    response_model=CombinedCaseResponse,
    status_code=status.HTTP_200_OK,
    tags=["Case Intake"],
    summary="Complete multi-step case intake evaluation",
    description=(
        "Executes follow-up generation, red-flag screening, and case summarization "
        "in a single coordinated service call."
    ),
)
async def analyze_case_endpoint(payload: CombinedCaseRequest) -> CombinedCaseResponse:
    try:
        # 1. Follow-up questions
        followup_req = FollowUpRequest(
            chief_complaint=payload.chief_complaint,
            symptoms=payload.symptoms,
            duration=payload.duration,
            severity=payload.severity,
            medical_history=payload.medical_history,
            medications=payload.medications,
            language=payload.language,
        )
        followup_res = await generate_followup_questions(followup_req)

        # 2. Red flags detection
        redflag_req = RedFlagRequest(
            chief_complaint=payload.chief_complaint,
            symptoms=payload.symptoms,
            duration=payload.duration,
            severity=payload.severity,
            answers=payload.answers,
            medical_history=payload.medical_history,
        )
        redflag_res = await detect_red_flags(redflag_req)

        # 3. Case summary (if answers provided or initial summary requested)
        summary_res = None
        if payload.answers or payload.symptoms:
            summary_req = CaseSummaryRequest(
                chief_complaint=payload.chief_complaint,
                symptoms=payload.symptoms,
                duration=payload.duration,
                severity=payload.severity,
                answers=payload.answers,
                medical_history=payload.medical_history,
                medications=payload.medications,
                language=payload.language,
            )
            summary_res = await generate_case_summary(summary_req)

        return CombinedCaseResponse(
            follow_up_questions=followup_res.questions,
            summary=summary_res,
            red_flags=redflag_res,
        )

    except Exception as e:
        logger.error(f"Error in combined case analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete combined case analysis.",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
