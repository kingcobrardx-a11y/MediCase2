"""Automated tests for MediCase AI Service endpoints and clinical workflows."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.ai_schemas import (
    FollowUpRequest,
    CaseSummaryRequest,
    RedFlagRequest,
)
from app.services.followup_service import generate_followup_questions
from app.services.summary_service import generate_case_summary
from app.services.redflag_service import detect_red_flags

client = TestClient(app)


# ==============================================================================
# Health and Root Endpoints
# ==============================================================================

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "MediCase" in data["service"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "provider" in data
    assert "model" in data


# ==============================================================================
# Feature 1: Adaptive Follow-Up Questions
# ==============================================================================

def test_followup_headache_endpoint():
    payload = {
        "chief_complaint": "Headache",
        "symptoms": ["headache", "nausea"],
        "duration": "2 days",
        "severity": 7,
        "medical_history": [],
        "medications": [],
    }
    response = client.post("/ai/follow-up", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) >= 4

    questions_text = " ".join(data["questions"]).lower()
    # Check context-aware headache questions
    assert any(k in questions_text for k in ["location", "where", "light", "vomiting", "severe", "onset"])


def test_followup_abdominal_pain_endpoint():
    payload = {
        "chief_complaint": "Abdominal pain",
        "symptoms": ["stomach cramps", "bloating"],
        "duration": "1 day",
        "severity": 6,
    }
    response = client.post("/ai/follow-up", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) >= 4

    questions_text = " ".join(data["questions"]).lower()
    # Check context-aware abdominal questions
    assert any(k in questions_text for k in ["food", "bowel", "eating", "stool", "location", "vomit", "cramp"])


def test_followup_hindi_endpoint():
    payload = {
        "chief_complaint": "सिर दर्द",
        "symptoms": ["सिर दर्द", "उल्टी"],
        "language": "hi",
    }
    response = client.post("/ai/follow-up", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) >= 3
    # Check that Hindi text is returned
    has_hindi = any("दर्द" in q or "सिर" in q or "क्या" in q for q in data["questions"])
    assert has_hindi, "Expected questions in Hindi"


# ==============================================================================
# Feature 2: Structured Case Summary
# ==============================================================================

def test_case_summary_endpoint():
    payload = {
        "chief_complaint": "Headache",
        "symptoms": ["headache", "nausea"],
        "duration": "2 days",
        "severity": 7,
        "answers": {
            "location": "Right side",
            "vomiting": "No",
            "light_sensitivity": "Yes",
        },
    }
    response = client.post("/ai/summary", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "summary" in data
    assert "key_symptoms" in data
    assert data["duration"] == "2 days"
    assert data["severity"] == 7

    summary_lower = data["summary"].lower()
    assert "headache" in summary_lower
    assert "right side" in summary_lower or "right-sided" in summary_lower
    assert "7" in summary_lower

    # Verify no diagnostic hallucination
    assert "migraine diagnosed" not in summary_lower
    assert "patient has stroke" not in summary_lower


# ==============================================================================
# Feature 3: Red Flag Detection
# ==============================================================================

def test_red_flags_chest_pain_and_dyspnea():
    payload = {
        "chief_complaint": "Chest pain",
        "symptoms": ["chest pain", "breathing difficulty"],
        "duration": "30 minutes",
        "severity": 8,
    }
    response = client.post("/ai/red-flags", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["requires_doctor_review"] is True
    assert len(data["red_flags"]) >= 1

    # Check for cautious language and no diagnostic assertions
    all_reasons = " ".join([f["reason"] for f in data["red_flags"]]).lower()
    assert "you have a heart attack" not in all_reasons
    assert any(w in all_reasons for w in ["potential red flag", "requires", "clinical", "doctor review"])


def test_red_flags_mild_symptom():
    payload = {
        "chief_complaint": "Mild runny nose",
        "symptoms": ["runny nose", "sneezing"],
        "duration": "1 day",
        "severity": 2,
    }
    response = client.post("/ai/red-flags", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Mild symptom with low severity should not trigger critical emergency review
    critical_flags = [f for f in data["red_flags"] if f["severity"] == "critical"]
    assert len(critical_flags) == 0


# ==============================================================================
# Combined Intake Analysis Endpoint
# ==============================================================================

def test_combined_case_analysis():
    payload = {
        "chief_complaint": "Chest pain",
        "symptoms": ["chest pain", "breathing difficulty"],
        "duration": "1 hour",
        "severity": 8,
        "answers": {
            "radiation": "Left arm",
            "sweating": "Yes",
        },
    }
    response = client.post("/ai/analyze-case", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "follow_up_questions" in data
    assert len(data["follow_up_questions"]) > 0
    assert "summary" in data
    assert data["summary"] is not None
    assert "red_flags" in data
    assert data["red_flags"]["requires_doctor_review"] is True


def test_service_functions_directly():
    import asyncio

    async def _run():
        # 1. Follow-up service
        fu_req = FollowUpRequest(
            chief_complaint="Knee pain",
            symptoms=["swelling", "stiffness"],
            duration="3 days",
            severity=5,
        )
        fu_res = await generate_followup_questions(fu_req)
        assert len(fu_res.questions) >= 3

        # 2. Summary service
        sum_req = CaseSummaryRequest(
            chief_complaint="Fever",
            symptoms=["fever", "chills"],
            duration="3 days",
            severity=6,
            answers={"cough": "dry", "sore_throat": "Yes"},
        )
        sum_res = await generate_case_summary(sum_req)
        assert "fever" in sum_res.summary.lower()
        assert sum_res.severity == 6

        # 3. Red flag service
        rf_req = RedFlagRequest(
            chief_complaint="Worst headache of my life",
            symptoms=["severe sudden headache", "neck stiffness"],
            severity=9,
        )
        rf_res = await detect_red_flags(rf_req)
        assert rf_res.requires_doctor_review is True

    asyncio.run(_run())
