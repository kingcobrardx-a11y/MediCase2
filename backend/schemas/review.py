from pydantic import BaseModel
from typing import Optional


class ReviewCreate(BaseModel):
    case_id: int
    doctor_id: int
    notes: Optional[str] = None
    status: str = "pending"