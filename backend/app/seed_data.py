import uuid
from sqlalchemy.orm import Session
from app.models.postgres import User, UserRole, Athlete, CoachProfile, AthleteAccessGrant
from app.core.security import hash_password

def seed_database(db: Session):
    """
    Seeds default demo staff and athlete accounts if database is empty.
    Allows instant testing of Coach, Physio, Scientist, and Athlete workflows.
    """
    existing = db.query(User).filter(User.email == "coach@injurysense.com").first()
    if existing:
        return

    pwd_hash = hash_password("password123")

    # 1. Coach
    coach_user = User(
        user_id=uuid.uuid4(),
        name="Alex Ferguson (Coach)",
        email="coach@injurysense.com",
        password=pwd_hash,
        role=UserRole.COACH,
        account_status="active"
    )
    db.add(coach_user)
    db.flush()

    coach_profile = CoachProfile(
        user_id=coach_user.user_id,
        unique_coach_id=f"COACH-{str(coach_user.user_id)[:8].upper()}",
        current_designation="Head Movement Coach",
        certification_level="Level 3 Elite Sports Performance"
    )
    db.add(coach_profile)

    # 2. Physiotherapist
    physio_user = User(
        user_id=uuid.uuid4(),
        name="Dr. Sarah Jenkins (Physio)",
        email="physio@injurysense.com",
        password=pwd_hash,
        role=UserRole.PHYSIOTHERAPIST,
        account_status="active"
    )
    db.add(physio_user)

    # 3. Sports Scientist
    scientist_user = User(
        user_id=uuid.uuid4(),
        name="Dr. Marcus Vance (Scientist)",
        email="scientist@injurysense.com",
        password=pwd_hash,
        role=UserRole.SPORTS_SCIENTIST,
        account_status="active"
    )
    db.add(scientist_user)

    # 4. Admin
    admin_user = User(
        user_id=uuid.uuid4(),
        name="System Administrator",
        email="admin@injurysense.com",
        password=pwd_hash,
        role=UserRole.ADMIN,
        account_status="active"
    )
    db.add(admin_user)

    # 5. Athlete
    athlete_user = User(
        user_id=uuid.uuid4(),
        name="Jordan Reed (Athlete)",
        email="athlete@injurysense.com",
        password=pwd_hash,
        role=UserRole.ATHLETE,
        account_status="active"
    )
    db.add(athlete_user)
    db.flush()

    athlete = Athlete(
        athlete_id=uuid.uuid4(),
        user_id=athlete_user.user_id,
        owning_coach_id=coach_user.user_id,
        sport="Track & Field",
        position="Sprinter",
        age=24,
        height=182.0,
        weight=75.0
    )
    db.add(athlete)
    db.flush()

    # Access grant from Coach to Physio & Scientist for demo athlete
    grant_physio = AthleteAccessGrant(
        athlete_id=athlete.athlete_id,
        granted_by_user_id=coach_user.user_id,
        granted_to_user_id=physio_user.user_id
    )
    grant_sci = AthleteAccessGrant(
        athlete_id=athlete.athlete_id,
        granted_by_user_id=coach_user.user_id,
        granted_to_user_id=scientist_user.user_id
    )
    db.add_all([grant_physio, grant_sci])

    db.commit()

