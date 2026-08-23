from pydantic import BaseModel
from typing import List, Optional

class SubtopicSchema(BaseModel):
    id: str
    name: str
    status: str = "not_started"
    confidence: Optional[int] = 3

    class Config:
        from_attributes = True

class TopicResponse(BaseModel):
    id: str
    name: str
    phase_number: int
    category: str
    description: Optional[str] = None
    status: str = "not_started"
    estimated_minutes: int = 300
    subtopics: List[SubtopicSchema] = []

    class Config:
        from_attributes = True
