from pydantic import BaseModel
from typing import Optional


class DoctorCreate(BaseModel):
    name: str
    specialization: Optional[str] = None
    email: Optional[str] = None