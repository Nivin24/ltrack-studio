from backend.routers.auth import router as auth_router
from backend.routers.topics import router as topics_router
from backend.routers.assignments import router as assignments_router
from backend.routers.checkins import router as checkins_router
from backend.routers.websockets import router as websockets_router

__all__ = ["auth_router", "topics_router", "assignments_router", "checkins_router", "websockets_router"]
