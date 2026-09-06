from fastapi import FastAPI
from models.patient import Patient
from models.case import Case
from routes.cases import router as case_router
from database.database import engine, Base
from routes.patients import router as patient_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="MediCase API",
    description="Patient Case-Taking Care System Backend",
    version="1.0.0"
)


# Include patient routes
app.include_router(patient_router)
app.include_router(case_router)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to MediCase API",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }