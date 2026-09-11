import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient

# Load environment variables from local .env file if present
load_dotenv()

# Get Database URL or fallback to SQLite for local development
POSTGRES_URL = os.getenv("DATABASE_URL", "sqlite:///./sports_injury.db")
if POSTGRES_URL and POSTGRES_URL.startswith("postgres://"):
    POSTGRES_URL = POSTGRES_URL.replace("postgres://", "postgresql://", 1)

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/sports_injury_mongo")

# Handle SQLite vs PostgreSQL engine arguments
if POSTGRES_URL.startswith("sqlite"):
    engine = create_engine(POSTGRES_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(POSTGRES_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# PyMongo setup (Schema models only for now)
try:
    mongo_client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=1000)
    mongo_db = mongo_client.get_database()
except Exception:
    mongo_client = None
    mongo_db = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
