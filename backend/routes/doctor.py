from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.doctor import Doctor
from schemas.doctor import DoctorCreate
from models.patient import Patient
from models.case import Case
from models.document import Document
from models.review import Review

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


# Create Doctor
@router.post("/")
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):
    new_doctor = Doctor(
        name=doctor.name,
        specialization=doctor.specialization,
        email=doctor.email
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return {
        "message": "Doctor created successfully",
        "doctor": new_doctor
    }


# Get All Doctors
@router.get("/")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()

    return doctors


# Get Single Doctor
@router.get("/{doctor_id}")
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        return {
            "message": "Doctor not found"
        }

    return doctor


# Doctor Dashboard
@router.get("/{doctor_id}/dashboard")
def doctor_dashboard(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    # Check doctor exists
    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        return {
            "message": "Doctor not found"
        }

    # Get reviews assigned to this doctor
    reviews = db.query(Review).filter(
        Review.doctor_id == doctor_id
    ).all()

    dashboard = []

    for review in reviews:

        case = db.query(Case).filter(
            Case.id == review.case_id
        ).first()

        if not case:
            continue

        patient = db.query(Patient).filter(
            Patient.id == case.patient_id
        ).first()

        documents = db.query(Document).filter(
            Document.case_id == case.id
        ).all()

        dashboard.append({
            "case_id": case.id,

            "patient": {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "phone": patient.phone,
                "email": patient.email
            } if patient else None,

            "case": {
                "chief_complaint": case.chief_complaint,
                "symptoms": case.symptoms,
                "duration": case.duration,
                "medical_history": case.medical_history,
                "allergies": case.allergies,
                "current_medications": case.current_medications
            },

            "documents": [
                {
                    "id": document.id,
                    "filename": document.filename,
                    "document_type": document.document_type,
                    "file_path": document.file_path
                }
                for document in documents
            ],

            "review": {
                "review_id": review.id,
                "status": review.status,
                "notes": review.notes
            }
        })

    return {
        "doctor": {
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization,
            "email": doctor.email
        },
        "total_cases": len(dashboard),
        "cases": dashboard
    }