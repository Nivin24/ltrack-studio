from pydantic import BaseModel
from typing import Optional

class AssignmentCreate(BaseModel):
    topic_id: str
    title: str
    description: Optional[str] = None
    difficulty: str = "Medium"
    deadline: Optional[str] = None
    expected_minutes: int = 60

class AssignmentResponse(AssignmentCreate):
    id: str

    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    assignment_id: str
    github_pr: Optional[str] = None
    branch: Optional[str] = None
    notes: Optional[str] = None
    code_snippet: Optional[str] = None

class EvaluationCreate(BaseModel):
    code_quality: int = 8
    understanding: int = 8
    testing: int = 7
    documentation: int = 8
    feedback: Optional[str] = None

class EvaluationResponse(EvaluationCreate):
    id: str
    overall_score: float
    graded_by: Optional[str] = None

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: str
    assignment_id: str
    user_id: str
    github_pr: Optional[str] = None
    branch: Optional[str] = None
    notes: Optional[str] = None
    code_snippet: Optional[str] = None
    status: str
    evaluation: Optional[EvaluationResponse] = None

    class Config:
        from_attributes = True
