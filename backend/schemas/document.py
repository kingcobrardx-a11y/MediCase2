from pydantic import BaseModel
from typing import Optional


class DocumentCreate(BaseModel):
    case_id: int
    document_type: Optional[str] = None