from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False
    )

    notes = Column(Text, nullable=True)

    status = Column(
        String,
        default="pending",
        nullable=False
    )