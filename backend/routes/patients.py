from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.patient import Patient
from schemas.patient import PatientCreate


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post("/")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        email=patient.email
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient created successfully",
        "patient": new_patient
    }


@router.get("/")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    return patients

@router.get("/{patient_id}")
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    return patient
    
@router.delete("/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully"
    }        