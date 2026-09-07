from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from models.review import Review
from models.case import Case
from models.doctor import Doctor
from schemas.review import ReviewCreate


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# Create Review
@router.post("/")
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db)
):
    # Check case
    case = db.query(Case).filter(
        Case.id == review.case_id
    ).first()

    if not case:
        return {
            "message": "Case not found"
        }

    # Check doctor
    doctor = db.query(Doctor).filter(
        Doctor.id == review.doctor_id
    ).first()

    if not doctor:
        return {
            "message": "Doctor not found"
        }

    new_review = Review(
        case_id=review.case_id,
        doctor_id=review.doctor_id,
        notes=review.notes,
        status=review.status
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "message": "Review created successfully",
        "review": new_review
    }


# Get all reviews
@router.get("/")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()

    return reviews


# Get reviews for a specific case
@router.get("/case/{case_id}")
def get_case_reviews(
    case_id: int,
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(
        Review.case_id == case_id
    ).all()

    return reviews