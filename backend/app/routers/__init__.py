from app.routers.auth import router as auth_router
from app.routers.athletes import router as athletes_router
from app.routers.videos import router as videos_router
from app.routers.users import router as users_router
from app.routers.analyses import router as analyses_router
from app.routers.coach import router as coach_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router

__all__ = ["auth_router", "athletes_router", "videos_router", "users_router", "analyses_router", "coach_router", "notifications_router", "admin_router"]


