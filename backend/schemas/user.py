from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "member"
    avatar: Optional[str] = None
    github: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    joined_date: Optional[str] = None
    streak: int = 0
    overall_progress: int = 0
    current_phase: Optional[str] = None
    target_hours_per_week: int = 8

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
