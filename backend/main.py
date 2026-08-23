from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base, AsyncSessionLocal
from backend.routers import auth_router, topics_router, assignments_router, checkins_router, websockets_router
from backend.models import UserModel, TopicModel, SubtopicModel
from backend.security import get_password_hash

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS Middleware Setup
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

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "LTrack FastAPI Backend",
        "version": settings.VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs"
    }
