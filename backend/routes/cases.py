from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.patient import Patient
from models.case import Case
from schemas.case import CaseCreate


router = APIRouter(
    prefix="/cases",
    tags=["Cases"]
)


@router.post("/")
def create_case(case: CaseCreate, db: Session = Depends(get_db)):

    new_case = Case(
        patient_id=case.patient_id,
        chief_complaint=case.chief_complaint,
        symptoms=case.symptoms,
        duration=case.duration,
        medical_history=case.medical_history,
        allergies=case.allergies,
        current_medications=case.current_medications
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return {
        "message": "Case created successfully",
        "case": new_case
    }

@router.get("/")
def get_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()

    return cases

@router.get("/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        return {
            "message": "Case not found"
        }

    return case

@router.put("/{case_id}")
def update_case(
    case_id: int,
    case: CaseCreate,
    db: Session = Depends(get_db)
):
    existing_case = db.query(Case).filter(Case.id == case_id).first()

    if not existing_case:
        return {
            "message": "Case not found"
        }

    existing_case.patient_id = case.patient_id
    existing_case.chief_complaint = case.chief_complaint
    existing_case.symptoms = case.symptoms
    existing_case.duration = case.duration
    existing_case.medical_history = case.medical_history
    existing_case.allergies = case.allergies
    existing_case.current_medications = case.current_medications

    db.commit()
    db.refresh(existing_case)

    return {
        "message": "Case updated successfully",
        "case": existing_case
    }

@router.delete("/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        return {
            "message": "Case not found"
        }

    db.delete(case)
    db.commit()

    return {
        "message": "Case deleted successfully"
    }
@router.get("/{patient_id}/cases")
def get_patient_cases(patient_id: int, db: Session = Depends(get_db)):
    cases = db.query(Case).filter(Case.patient_id == patient_id).all()

    return cases

