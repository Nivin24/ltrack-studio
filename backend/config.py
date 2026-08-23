from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LTrack API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT Signing
    SECRET_KEY: str = "ltrack-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings (PostgreSQL default with SQLite fallback for local quick testing)
    DATABASE_URL: str = "sqlite+aiosqlite:///./ltrack.db"
    
    class Config:
        case_sensitive = True

settings = Settings()
