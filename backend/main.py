from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base, AsyncSessionLocal
from backend.routers.auth import router as auth_router
from backend.routers.topics import router as topics_router
from backend.routers.assignments import router as assignments_router
from backend.routers.checkins import router as checkins_router
from backend.routers.websockets import router as websockets_router
from backend.models.user import UserModel
from backend.security import get_password_hash
import logging

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS for all frontend clients (Vercel, localhost, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(topics_router, prefix=settings.API_V1_STR)
app.include_router(assignments_router, prefix=settings.API_V1_STR)
app.include_router(checkins_router, prefix=settings.API_V1_STR)
app.include_router(websockets_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Seed default admin & initial topics if empty
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            res = await session.execute(select(UserModel).where(UserModel.id == "usr_1"))
            if not res.scalar_one_or_none():
                admin_user = UserModel(
                    id="usr_1",
                    name="Nivin (Admin)",
                    email="admin@devtrack.io",
                    hashed_password=get_password_hash("admin123"),
                    role="admin",
                    avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    github="nivin-dev",
                    joined_date="2026-08-01",
                    current_phase="Phase 4: FastAPI Dependency Injection"
                )
                session.add(admin_user)
                await session.commit()
        logger.info("✅ Database tables verified and seed data initialized successfully.")
    except Exception as e:
        logger.warning(f"⚠️ Database connection warning during startup: {e}")
        logger.info("ℹ️ Tip for Supabase: Use the Connection Pooler URL (pooler.supabase.com:6543) instead of direct db.[ref].supabase.co (IPv6).")

@app.get("/")
async def root():
    return {
        "status": "online",
        "platform": "LTrack API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
