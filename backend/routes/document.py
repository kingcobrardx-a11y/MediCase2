from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil

from database.database import get_db
from models.document import Document
from models.case import Case


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# Upload document
@router.post("/upload")
def upload_document(
    case_id: int = Form(...),
    document_type: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check whether case exists
    case = db.query(Case).filter(
        Case.id == case_id
    ).first()

    if not case:
        return {
            "message": "Case not found"
        }

    # Create uploads folder
    upload_folder = "uploads"
    os.makedirs(upload_folder, exist_ok=True)

    # Save file
    file_path = os.path.join(
        upload_folder,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save document information in database
    new_document = Document(
        case_id=case_id,
        filename=file.filename,
        file_path=file_path,
        document_type=document_type
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return {
        "message": "Document uploaded successfully",
        "document": new_document
    }


# Get documents of a case
@router.get("/case/{case_id}")
def get_case_documents(
    case_id: int,
    db: Session = Depends(get_db)
):
    documents = db.query(Document).filter(
        Document.case_id == case_id
    ).all()

    return documents