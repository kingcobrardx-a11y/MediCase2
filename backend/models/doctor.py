from sqlalchemy import Column, Integer, String
from database.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    specialization = Column(String, nullable=True)

    email = Column(String, nullable=True)