from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    chief_complaint = Column(Text, nullable=False)
    symptoms = Column(Text, nullable=True)
    duration = Column(String, nullable=True)
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)