from pydantic import BaseModel
from typing import Optional


class CaseCreate(BaseModel):
    patient_id: int
    chief_complaint: str
    symptoms: Optional[str] = None
    duration: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    status: str = "pending"


class CaseStatusUpdate(BaseModel):
    status: str