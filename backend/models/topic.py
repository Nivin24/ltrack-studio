from sqlalchemy import String, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class TopicModel(Base):
    __tablename__ = "topics"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phase_number: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started") # completed, learning, not_started
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=300)

    subtopics = relationship("SubtopicModel", back_populates="topic", cascade="all, delete-orphan")
    assignments = relationship("AssignmentModel", back_populates="topic")

class SubtopicModel(Base):
    __tablename__ = "subtopics"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    topic_id: Mapped[str] = mapped_column(String(50), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="not_started")
    confidence: Mapped[int] = mapped_column(Integer, default=3)

    topic = relationship("TopicModel", back_populates="subtopics")
