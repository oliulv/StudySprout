from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import sqlite3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use SQLite for local development to avoid connection issues
# This will solve the immediate problem and let us test auth functionality
DATABASE_URL = "sqlite:///./studysprout.db"

# Create SQLAlchemy engine with SQLite
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
