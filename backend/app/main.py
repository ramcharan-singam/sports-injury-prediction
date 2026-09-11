import sys
import os

# Ensure backend directory and parent directory are in sys.path for both local and cloud container imports
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_current_dir)
_parent_dir = os.path.dirname(_backend_dir)
for _d in (_backend_dir, _parent_dir, _current_dir):
    if _d and _d not in sys.path:
        sys.path.insert(0, _d)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.database import engine, Base, SessionLocal
from app.routers import (
    auth_router, athletes_router, videos_router, users_router, analyses_router, coach_router, notifications_router, admin_router
)

from app.seed_data import seed_database

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema for new columns if using SQLite
def run_sqlite_migrations():
    if engine.name != "sqlite":
        return
    try:
        with engine.connect() as conn:
            # Add account_status column if missing
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [r[1] for r in res.fetchall()]
            if "account_status" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN account_status VARCHAR DEFAULT 'active'"))
                conn.commit()

            # Add owning_coach_id column if missing
            res = conn.execute(text("PRAGMA table_info(athletes)"))
            cols = [r[1] for r in res.fetchall()]
            if "owning_coach_id" not in cols:
                conn.execute(text("ALTER TABLE athletes ADD COLUMN owning_coach_id CHAR(36)"))
                conn.commit()

            # Add athlete columns if missing
            res = conn.execute(text("PRAGMA table_info(athletes)"))
            cols = [r[1] for r in res.fetchall()]
            new_athlete_cols = {
                "dob": "DATE",
                "gender": "VARCHAR DEFAULT 'Unspecified'",
                "dominant_leg": "VARCHAR DEFAULT 'Right'",
                "team_name": "VARCHAR",
                "jersey_number": "VARCHAR",
                "years_experience": "FLOAT DEFAULT 1.0",
                "competition_level": "VARCHAR DEFAULT 'Amateur'",
                "training_frequency": "INTEGER DEFAULT 4",
                "previous_injuries_summary": "TEXT",
                "injury_recurrence_flag": "VARCHAR DEFAULT 'No'",
                "current_injury_status": "VARCHAR DEFAULT 'Fully Cleared'",
                "nordic_strength_score": "FLOAT",
                "hamstring_flexibility": "FLOAT",
                "baseline_less_score": "FLOAT",
                "quad_hamstring_ratio": "FLOAT",
                "parental_consent": "VARCHAR DEFAULT 'Cleared / N/A'",
                "medical_clearance_status": "VARCHAR DEFAULT 'Cleared'",
                "emergency_contact": "VARCHAR"
            }
            for col_name, col_type in new_athlete_cols.items():
                if col_name not in cols:
                    try:
                        conn.execute(text(f"ALTER TABLE athletes ADD COLUMN {col_name} {col_type}"))
                    except Exception as ex:
                        print(f"Column migration notice ({col_name}):", ex)
            conn.commit()

            # Add injury_history columns if missing
            res = conn.execute(text("PRAGMA table_info(injury_history)"))
            cols = [r[1] for r in res.fetchall()]
            if "symptoms" not in cols:
                conn.execute(text("ALTER TABLE injury_history ADD COLUMN symptoms TEXT"))
            if "treatment_details" not in cols:
                conn.execute(text("ALTER TABLE injury_history ADD COLUMN treatment_details TEXT"))
            if "rehabilitation_exercises" not in cols:
                conn.execute(text("ALTER TABLE injury_history ADD COLUMN rehabilitation_exercises TEXT"))
            if "recovery_progress" not in cols:
                conn.execute(text("ALTER TABLE injury_history ADD COLUMN recovery_progress FLOAT DEFAULT 0.0"))
            if "rehab_status" not in cols:
                conn.execute(text("ALTER TABLE injury_history ADD COLUMN rehab_status VARCHAR DEFAULT 'In Rehab'"))
            conn.commit()

            # Add coach_profiles columns if missing
            res = conn.execute(text("PRAGMA table_info(coach_profiles)"))
            cols = [r[1] for r in res.fetchall()]
            new_coach_cols = {
                "qualification": "VARCHAR",
                "coaching_specialization": "VARCHAR",
                "years_coaching_experience": "INTEGER DEFAULT 10",
                "primary_sport": "VARCHAR",
                "club_academy": "VARCHAR",
                "coaching_level": "VARCHAR DEFAULT 'Elite'",
                "certifications_licenses": "TEXT",
                "sports_worked_with": "TEXT",
                "achievements": "TEXT",
                "areas_of_expertise": "TEXT",
                "location": "VARCHAR",
                "languages": "VARCHAR",
                "bio": "TEXT",
                "verification_status": "VARCHAR DEFAULT 'Verified ✅'",
                "teams_athletes_coached": "VARCHAR"
            }
            for col_name, col_type in new_coach_cols.items():
                if col_name not in cols:
                    try:
                        conn.execute(text(f"ALTER TABLE coach_profiles ADD COLUMN {col_name} {col_type}"))
                    except Exception as ex:
                        print(f"Column migration notice ({col_name}):", ex)
            conn.commit()

            # Add physio_assessments columns if missing
            res = conn.execute(text("PRAGMA table_info(physio_assessments)"))
            cols = [r[1] for r in res.fetchall()]
            if "recommendations" not in cols:
                conn.execute(text("ALTER TABLE physio_assessments ADD COLUMN recommendations TEXT"))
            if "precautions" not in cols:
                conn.execute(text("ALTER TABLE physio_assessments ADD COLUMN precautions TEXT"))
            conn.commit()
    except Exception as e:
        print("SQLite migration notice:", e)

run_sqlite_migrations()

# Seed database
try:
    db = SessionLocal()
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="Sports Injury Risk Detection API",
    description="Backend foundation for athlete profiling, injury history tracking, and movement assessment video processing.",
    version="1.0.0"
)

# Enable CORS for React frontend & Render/Vercel deployments
default_origins = [
    "https://sports-injury-prediction-git-main-vidhura.vercel.app",
    "https://sports-injury-prediction-mi77s6xto-vidhura.vercel.app",
    "https://sports-injury-prediction.vercel.app",
    "https://sports-injury-prediction-6.onrender.com",
    "https://injurysense-frontend.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]
cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env:
    extra_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    origins = list(set(default_origins + extra_origins))
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static files
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API routers
app.include_router(auth_router)
app.include_router(athletes_router)
app.include_router(videos_router)
app.include_router(users_router)
app.include_router(analyses_router)
app.include_router(coach_router)
app.include_router(notifications_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Sports Injury Risk Detection API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "healthy"}
