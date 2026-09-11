import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.postgres import User, Athlete, AthleteAccessGrant, UserRole, Notification
from app.core.security import hash_password, create_access_token

TEST_DB_URL = "sqlite:///./test_sports_injury.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def setup_notif_data(db_session):
    pwd = hash_password("password123")
    
    athlete_user = User(
        name="Athlete One",
        email="athlete_notif@test.com",
        password=pwd,
        role=UserRole.ATHLETE,
        account_status="active"
    )
    physio_user = User(
        name="Physio One",
        email="physio_notif@test.com",
        password=pwd,
        role=UserRole.PHYSIOTHERAPIST,
        account_status="active"
    )
    coach_user = User(
        name="Coach One",
        email="coach_notif@test.com",
        password=pwd,
        role=UserRole.COACH,
        account_status="active"
    )
    db_session.add_all([athlete_user, physio_user, coach_user])
    db_session.commit()

    athlete_user = db_session.query(User).filter(User.email == "athlete_notif@test.com").first()
    physio_user = db_session.query(User).filter(User.email == "physio_notif@test.com").first()
    coach_user = db_session.query(User).filter(User.email == "coach_notif@test.com").first()

    athlete = Athlete(
        user_id=athlete_user.user_id,
        owning_coach_id=coach_user.user_id,
        sport="Basketball",
        position="Guard",
        age=22,
        height=180.0,
        weight=75.0
    )
    db_session.add(athlete)
    db_session.commit()
    db_session.refresh(athlete)

    grant = AthleteAccessGrant(
        athlete_id=athlete.athlete_id,
        granted_to_user_id=physio_user.user_id,
        granted_by_user_id=coach_user.user_id
    )
    db_session.add(grant)
    db_session.commit()

    athlete_token = create_access_token({"user_id": str(athlete_user.user_id), "role": athlete_user.role.value})
    physio_token = create_access_token({"user_id": str(physio_user.user_id), "role": physio_user.role.value})

    return {
        "athlete": athlete,
        "athlete_user": athlete_user,
        "physio_user": physio_user,
        "ath_headers": {"Authorization": f"Bearer {athlete_token}"},
        "phy_headers": {"Authorization": f"Bearer {physio_token}"}
    }

def test_physio_creates_overall_insight_notification(setup_notif_data):
    ath = setup_notif_data["athlete"]
    phy_headers = setup_notif_data["phy_headers"]
    ath_headers = setup_notif_data["ath_headers"]

    res_insight = client.post(
        f"/api/athletes/{ath.athlete_id}/overall-insight",
        headers=phy_headers,
        json={
            "overall_status": "Active Rehab",
            "overall_comment": "Patient demonstrating progressive knee stability.",
            "recovery_progress_percent": 65.0,
            "current_restrictions": "No heavy jump land drills."
        }
    )
    assert res_insight.status_code == 201

    res_notifs = client.get("/api/notifications", headers=ath_headers)
    assert res_notifs.status_code == 200
    notifs = res_notifs.json()
    assert len(notifs) >= 1
    assert notifs[0]["title"] == "Physiotherapist Insight Updated"

def test_physio_creates_rehab_plan_notification(setup_notif_data):
    ath = setup_notif_data["athlete"]
    phy_headers = setup_notif_data["phy_headers"]
    ath_headers = setup_notif_data["ath_headers"]

    res_plan = client.post(
        f"/api/athletes/{ath.athlete_id}/rehab-plans",
        headers=phy_headers,
        json={
            "precautions": "Avoid deep knee flexion > 90°",
            "target_clearance_date": "2026-10-15",
            "exercises": [
                {"exercise_name": "Glute Bridges", "sets": 3, "reps": 12, "frequency": "1x daily"}
            ]
        }
    )
    assert res_plan.status_code == 201

    res_notifs = client.get("/api/notifications", headers=ath_headers)
    assert res_notifs.status_code == 200
    notifs = res_notifs.json()
    assert len(notifs) >= 2

    res_count = client.get("/api/notifications/unread-count", headers=ath_headers)
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] >= 2

    first_id = notifs[0]["notification_id"]
    res_read = client.put(f"/api/notifications/{first_id}/read", headers=ath_headers)
    assert res_read.status_code == 200
    assert res_read.json()["is_read"] is True

    res_read_all = client.put("/api/notifications/read-all", headers=ath_headers)
    assert res_read_all.status_code == 200

    res_count3 = client.get("/api/notifications/unread-count", headers=ath_headers)
    assert res_count3.json()["unread_count"] == 0
