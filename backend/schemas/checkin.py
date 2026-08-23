from pydantic import BaseModel
from typing import Optional

class DailyCheckInCreate(BaseModel):
    date: str
    completed_learning: str = "yes"
    time_spent_minutes: int = 60
    confidence_score: int = 4
    difficulty: str = "medium"
    what_learned: Optional[str] = None
    confused_about: Optional[str] = None
    to_revise: Optional[str] = None

class DailyCheckInResponse(DailyCheckInCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True
