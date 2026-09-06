from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL connection
DATABASE_URL = "postgresql+psycopg2://postgres:CHARU@localhost:5432/medicase"

# Create database engine
engine = create_engine(DATABASE_URL)

# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()