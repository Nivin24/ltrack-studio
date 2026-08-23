from sqlalchemy import String, Integer, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class DailyCheckInModel(Base):
    __tablename__ = "daily_checkins"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    completed_learning: Mapped[str] = mapped_column(String(20), default="yes") # yes, partially, no
    time_spent_minutes: Mapped[int] = mapped_column(Integer, default=60)
    confidence_score: Mapped[int] = mapped_column(Integer, default=4)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    what_learned: Mapped[str] = mapped_column(Text, nullable=True)
    confused_about: Mapped[str] = mapped_column(Text, nullable=True)
    to_revise: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("UserModel", back_populates="checkins")
