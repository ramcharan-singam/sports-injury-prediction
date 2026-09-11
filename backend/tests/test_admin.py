import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.models.postgres import User, UserRole
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
def setup_admin_test_env():
    session = TestSessionLocal()

    admin = session.query(User).filter(User.email == "admin_test_suite@test.com").first()
    if not admin:
        pwd = hash_password("password123")
        admin = User(user_id=uuid.uuid4(), name="Test Admin", email="admin_test_suite@test.com", password=pwd, role=UserRole.ADMIN, account_status="active")
        physio = User(user_id=uuid.uuid4(), name="Test Physio Staff", email="physio_admin_test@test.com", password=pwd, role=UserRole.PHYSIOTHERAPIST, account_status="active")
        session.add_all([admin, physio])
        session.commit()
        session.refresh(admin)
        session.refresh(physio)
    else:
        physio = session.query(User).filter(User.email == "physio_admin_test@test.com").first()

    admin_token = create_access_token({"user_id": str(admin.user_id), "role": admin.role.value})
    physio_token = create_access_token({"user_id": str(physio.user_id), "role": physio.role.value})

    env = {
        "admin_headers": {"Authorization": f"Bearer {admin_token}"},
        "physio_headers": {"Authorization": f"Bearer {physio_token}"},
        "admin_user_id": str(admin.user_id),
        "physio_user_id": str(physio.user_id)
    }
    yield env
    session.close()

def test_non_admin_forbidden(setup_admin_test_env):
    """Non-admin user receiving 403 when hitting /api/admin/* endpoints."""
    res = client.get("/api/admin/users", headers=setup_admin_test_env["physio_headers"])
    assert res.status_code == 403

def test_admin_list_users(setup_admin_test_env):
    """Admin lists all platform users."""
    res = client.get("/api/admin/users", headers=setup_admin_test_env["admin_headers"])
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2

def test_admin_user_status_update(setup_admin_test_env):
    """Admin updates user account status and generates audit log."""
    physio_id = setup_admin_test_env["physio_user_id"]
    payload = {"account_status": "suspended", "reason": "Violation of terms"}
    res = client.put(f"/api/admin/users/{physio_id}/status", json=payload, headers=setup_admin_test_env["admin_headers"])
    assert res.status_code == 200
    assert "updated to suspended" in res.json()["message"]

def test_admin_professional_verification(setup_admin_test_env):
    """Admin views pending professionals and approves verification."""
    res_list = client.get("/api/admin/professionals", headers=setup_admin_test_env["admin_headers"])
    assert res_list.status_code == 200

    physio_id = setup_admin_test_env["physio_user_id"]
    res_verify = client.put(f"/api/admin/professionals/{physio_id}/verify", headers=setup_admin_test_env["admin_headers"])
    assert res_verify.status_code == 200
    assert "approved" in res_verify.json()["message"]

def test_admin_platform_health_and_metrics(setup_admin_test_env):
    """Admin views platform health and aggregate telemetry metrics."""
    res_metrics = client.get("/api/admin/platform/metrics", headers=setup_admin_test_env["admin_headers"])
    assert res_metrics.status_code == 200
    assert "total_users" in res_metrics.json()

    res_health = client.get("/api/admin/platform/health", headers=setup_admin_test_env["admin_headers"])
    assert res_health.status_code == 200
    assert "OPERATIONAL" in res_health.json()["api_status"]

def test_admin_audit_logs(setup_admin_test_env):
    """Admin queries security audit trail."""
    res_logs = client.get("/api/admin/audit-logs", headers=setup_admin_test_env["admin_headers"])
    assert res_logs.status_code == 200
    logs = res_logs.json()
    assert len(logs) > 0
