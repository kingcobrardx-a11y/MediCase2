from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.patient import Patient
from models.document import Document
from models.case import Case
from routes.cases import router as case_router
from database.database import engine, Base
from routes.patients import router as patient_router
from routes.document import router as document_router
from models.doctor import Doctor
from routes.doctor import router as doctor_router
from models.review import Review
from routes.review import router as review_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="MediCase API",
    description="Patient Case-Taking Care System Backend",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include patient routes
app.include_router(patient_router)
app.include_router(case_router)
app.include_router(document_router)
app.include_router(doctor_router)
app.include_router(review_router)


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