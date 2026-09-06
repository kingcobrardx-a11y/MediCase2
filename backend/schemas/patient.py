from pydantic import BaseModel
from typing import Optional


class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None