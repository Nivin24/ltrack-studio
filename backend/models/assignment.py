from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.database import Base

class AssignmentModel(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    topic_id: Mapped[str] = mapped_column(String(50), ForeignKey("topics.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(20), default="Medium")
    deadline: Mapped[str] = mapped_column(String(20), nullable=True)
    expected_minutes: Mapped[int] = mapped_column(Integer, default=60)
    required_github: Mapped[bool] = mapped_column(default=True)

    topic = relationship("TopicModel", back_populates="assignments")
    submissions = relationship("SubmissionModel", back_populates="assignment", cascade="all, delete-orphan")

class SubmissionModel(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    assignment_id: Mapped[str] = mapped_column(String(50), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    submitted_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    github_pr: Mapped[str] = mapped_column(String(255), nullable=True)
    branch: Mapped[str] = mapped_column(String(100), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    code_snippet: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="submitted") # submitted, evaluated

    assignment = relationship("AssignmentModel", back_populates="submissions")
    user = relationship("UserModel", back_populates="submissions")
    evaluation = relationship("EvaluationModel", back_populates="submission", uselist=False, cascade="all, delete-orphan")

class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    submission_id: Mapped[str] = mapped_column(String(50), ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False)
    code_quality: Mapped[int] = mapped_column(Integer, default=8)
    understanding: Mapped[int] = mapped_column(Integer, default=8)
    testing: Mapped[int] = mapped_column(Integer, default=7)
    documentation: Mapped[int] = mapped_column(Integer, default=8)
    overall_score: Mapped[float] = mapped_column(Float, default=8.0)
    feedback: Mapped[str] = mapped_column(Text, nullable=True)
    graded_by: Mapped[str] = mapped_column(String(100), nullable=True)
    graded_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    submission = relationship("SubmissionModel", back_populates="evaluation")
