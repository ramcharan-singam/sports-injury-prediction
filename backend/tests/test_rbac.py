import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.postgres import User, Athlete, InjuryHistory, Video, AthleteAccessGrant, UserRole
from app.core.security import hash_password, create_access_token

# Use isolated test database so running pytest NEVER wipes the main development database
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
def db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def setup_users(db):
    """Setup test users for all 5 roles under NEW Ownership Model."""
    pwd = hash_password("password123")
    
    users = {}
    roles = [UserRole.ATHLETE, UserRole.COACH, UserRole.PHYSIOTHERAPIST, UserRole.SPORTS_SCIENTIST, UserRole.ADMIN]
    
    for r in roles:
        u = db.query(User).filter(User.email == f"test_{r.value.lower().replace(' ', '_')}@test.com").first()
        if not u:
            u = User(
                name=f"Test {r.value}",
                email=f"test_{r.value.lower().replace(' ', '_')}@test.com",
                password=pwd,
                role=r,
                account_status="active",
                phone="+1555000000"
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        
        token = create_access_token({"user_id": str(u.user_id), "role": u.role.value})
        users[r.value] = {"user": u, "token": token, "headers": {"Authorization": f"Bearer {token}"}}
        
    coach_user = users["Coach"]["user"]
    ath_user = users["Athlete"]["user"]

    # Link Athlete to Coach
    ath = db.query(Athlete).filter(Athlete.user_id == ath_user.user_id).first()
    if not ath:
        ath = Athlete(
            user_id=ath_user.user_id,
            owning_coach_id=coach_user.user_id,
            sport="Football",
            position="Forward",
            age=22,
            height=180.0,
            weight=75.0,
            training_load=70.0,
            flexibility=80.0,
            strength=80.0,
            balance=80.0,
            endurance=80.0,
            coach_notes="Test notes"
        )
        db.add(ath)
        db.commit()
        db.refresh(ath)
    else:
        ath.owning_coach_id = coach_user.user_id
        db.commit()

    users["Athlete"]["athlete"] = ath
    return users

# 1. Coach Athlete Registration & Ownership Tests
def test_coach_registers_athlete(setup_users):
    """Coach registers new athlete via POST /api/coach/athletes."""
    headers = setup_users["Coach"]["headers"]
    payload = {
        "name": "New Player",
        "email": "new_player_2026@test.com",
        "sport": "Basketball",
        "position": "Guard",
        "age": 20,
        "height": 190.0,
        "weight": 85.0
    }
    response = client.post("/api/coach/athletes", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["account_status"] == "pending_activation"
    assert "activation_token" in data
    assert "activation_url" in data

def test_activate_athlete_account(setup_users):
    """Public POST /api/auth/activate activates athlete account."""
    headers = setup_users["Coach"]["headers"]
    reg_res = client.post("/api/coach/athletes", json={
        "name": "To Activate",
        "email": "to_activate_2026@test.com",
        "sport": "Soccer",
        "position": "Midfielder",
        "age": 21,
        "height": 175.0,
        "weight": 70.0
    }, headers=headers)
    token = reg_res.json()["activation_token"]

    act_res = client.post("/api/auth/activate", json={
        "token": token,
        "new_password": "newpassword123"
    })
    assert act_res.status_code == 200
    assert "activated successfully" in act_res.json()["message"]

def test_athlete_self_register_disabled():
    """POST /api/auth/register with role=Athlete returns 400 Bad Request."""
    payload = {
        "name": "Self Reg Athlete",
        "email": "self_reg@test.com",
        "password": "password123",
        "role": "Athlete"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Athletes cannot self-register" in response.json()["detail"]

# 2. Coach Full Edit Access on Owned Athlete
def test_coach_full_edit_access(setup_users):
    """Coach has FULL EDIT ACCESS across all fields for owned athlete (including height/sport)."""
    headers = setup_users["Coach"]["headers"]
    athlete_id = str(setup_users["Athlete"]["athlete"].athlete_id)
    
    payload = {
        "sport": "Rugby",
        "position": "Winger",
        "height": 185.0,
        "training_load": 88.0,
        "coach_notes": "Updated full profile"
    }
    response = client.put(f"/api/athletes/{athlete_id}", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["sport"] == "Rugby"
    assert data["height"] == 185.0

# 3. Access Grant System (Physio & Scientist Gating)
def test_access_grants_workflow(setup_users, db):
    """Coach grants access to Physio. Physio gets read/write access. Revoking revokes access."""
    coach_headers = setup_users["Coach"]["headers"]
    physio_headers = setup_users["Physiotherapist"]["headers"]
    physio_user_id = str(setup_users["Physiotherapist"]["user"].user_id)
    athlete_id = str(setup_users["Athlete"]["athlete"].athlete_id)

    # 1. Before Grant: Physio is denied (403)
    res_before = client.get(f"/api/athletes/{athlete_id}", headers=physio_headers)
    assert res_before.status_code == 403

    # 2. Coach Grants Access to Physio
    grant_res = client.post(f"/api/athletes/{athlete_id}/grants", json={"granted_to_user_id": physio_user_id}, headers=coach_headers)
    assert grant_res.status_code == 201
    grant_id = grant_res.json()["grant_id"]

    # 3. After Grant: Physio can view profile & add injury record
    res_after = client.get(f"/api/athletes/{athlete_id}", headers=physio_headers)
    assert res_after.status_code == 200

    inj_res = client.post(f"/api/athletes/{athlete_id}/injuries", json={
        "injury_type": "Ankle Sprain",
        "body_part": "Ankle",
        "severity": "Mild",
        "injury_date": "2026-03-01"
    }, headers=physio_headers)
    assert inj_res.status_code == 201

    # 4. Coach Revokes Grant -> Physio is denied again (403)
    revoke_res = client.delete(f"/api/athletes/{athlete_id}/grants/{grant_id}", headers=coach_headers)
    assert revoke_res.status_code == 200

    res_revoked = client.get(f"/api/athletes/{athlete_id}", headers=physio_headers)
    assert res_revoked.status_code == 403

# 4. Admin Unrestricted Access Tests
def test_admin_unrestricted_access(setup_users):
    """Admin has UNRESTRICTED write/read access everywhere."""
    admin_headers = setup_users["Admin"]["headers"]
    athlete_id = str(setup_users["Athlete"]["athlete"].athlete_id)

    # Admin updates athlete profile -> 200 OK
    res_put = client.put(f"/api/athletes/{athlete_id}", json={"training_load": 95.0}, headers=admin_headers)
    assert res_put.status_code == 200

    # Admin posts injury record -> 201 Created
    res_inj = client.post(f"/api/athletes/{athlete_id}/injuries", json={
        "injury_type": "Contusion",
        "body_part": "Shin",
        "severity": "Mild",
        "injury_date": "2026-03-05"
    }, headers=admin_headers)
    assert res_inj.status_code == 201

def test_new_athlete_auto_grants_active_physio(setup_users):
    """When Coach registers a NEW athlete, any active Physio access grant issued by that Coach is automatically applied to the new athlete."""
    coach_headers = setup_users["Coach"]["headers"]
    physio_headers = setup_users["Physiotherapist"]["headers"]
    physio_user_id = str(setup_users["Physiotherapist"]["user"].user_id)
    athlete_id = str(setup_users["Athlete"]["athlete"].athlete_id)

    # Coach issues access grant to Physio for existing athlete
    client.post(f"/api/athletes/{athlete_id}/grants", json={"granted_to_user_id": physio_user_id}, headers=coach_headers)

    # Coach registers a brand NEW athlete
    new_reg = client.post("/api/coach/athletes", json={
        "name": "Auto Granted Athlete",
        "email": "auto_granted@test.com",
        "sport": "Tennis",
        "position": "Player",
        "age": 23,
        "height": 182.0,
        "weight": 76.0
    }, headers=coach_headers)
    assert new_reg.status_code == 201
    new_athlete_id = new_reg.json()["athlete_id"]

    # Physio can immediately access the new athlete without extra grant step
    res = client.get(f"/api/athletes/{new_athlete_id}", headers=physio_headers)
    assert res.status_code == 200
