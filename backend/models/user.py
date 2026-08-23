from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="member") # admin or member
    avatar: Mapped[str] = mapped_column(String(255), nullable=True)
    github: Mapped[str] = mapped_column(String(100), nullable=True)
    joined_date: Mapped[str] = mapped_column(String(20), nullable=True)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    overall_progress: Mapped[int] = mapped_column(Integer, default=0)
    current_phase: Mapped[str] = mapped_column(String(150), nullable=True)
    target_hours_per_week: Mapped[int] = mapped_column(Integer, default=8)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    submissions = relationship("SubmissionModel", back_populates="user", cascade="all, delete-orphan")
    checkins = relationship("DailyCheckInModel", back_populates="user", cascade="all, delete-orphan")
