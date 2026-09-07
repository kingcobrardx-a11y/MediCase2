from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.patient import Patient
from models.case import Case
from schemas.case import CaseCreate, CaseStatusUpdate


router = APIRouter(
    prefix="/cases",
    tags=["Cases"]
)


# =========================
# CREATE CASE
# =========================

@router.post("/")
def create_case(
    case: CaseCreate,
    db: Session = Depends(get_db)
):
    # Check if patient exists
    patient = db.query(Patient).filter(
        Patient.id == case.patient_id
    ).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    new_case = Case(
        patient_id=case.patient_id,
        chief_complaint=case.chief_complaint,
        symptoms=case.symptoms,
        duration=case.duration,
        medical_history=case.medical_history,
        allergies=case.allergies,
        current_medications=case.current_medications,
        status=case.status
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return {
        "message": "Case created successfully",
        "case": new_case
    }


# =========================
# GET ALL CASES
# =========================

@router.get("/")
def get_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()

    return cases


# =========================
# GET CASES OF A PATIENT
# =========================

@router.get("/patient/{patient_id}")
def get_patient_cases(
    patient_id: int,
    db: Session = Depends(get_db)
):
    # Check if patient exists
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    cases = db.query(Case).filter(
        Case.patient_id == patient_id
    ).all()

    return cases


# =========================
# GET SINGLE CASE
# =========================

@router.get("/{case_id}")
def get_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(
        Case.id == case_id
    ).first()

    if not case:
        return {
            "message": "Case not found"
        }

    return case


# =========================
# UPDATE CASE
# =========================

# =========================
# UPDATE CASE STATUS
# =========================

@router.put("/{case_id}/status")
def update_case_status(
    case_id: int,
    status_data: CaseStatusUpdate,
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(
        Case.id == case_id
    ).first()

    if not case:
        return {
            "message": "Case not found"
        }

    allowed_statuses = [
        "pending",
        "under_review",
        "verified",
        "completed"
    ]

    if status_data.status not in allowed_statuses:
        return {
            "message": "Invalid status",
            "allowed_statuses": allowed_statuses
        }

    case.status = status_data.status

    db.commit()
    db.refresh(case)

    return {
        "message": "Case status updated successfully",
        "case_id": case.id,
        "status": case.status
    }


# =========================
# DELETE CASE
# =========================

@router.delete("/{case_id}")
def delete_case(
    case_id: int,
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(
        Case.id == case_id
    ).first()

    if not case:
        return {
            "message": "Case not found"
        }

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully"
    }