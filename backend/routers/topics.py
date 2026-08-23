from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from backend.database import get_async_session
from backend.models.topic import TopicModel, SubtopicModel
from backend.schemas.topic import TopicResponse, SubtopicSchema
from backend.routers.auth import get_current_user
from backend.models.user import UserModel

router = APIRouter(prefix="/topics", tags=["Topics & Syllabus"])

@router.get("", response_model=List[TopicResponse])
async def list_topics(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(
        select(TopicModel).options(selectinload(TopicModel.subtopics)).order_by(TopicModel.phase_number)
    )
    return result.scalars().all()

@router.patch("/subtopics/{subtopic_id}", response_model=SubtopicSchema)
async def update_subtopic_status(
    subtopic_id: str,
    status: str,
    session: AsyncSession = Depends(get_async_session),
    current_user: UserModel = Depends(get_current_user)
):
    result = await session.execute(select(SubtopicModel).where(SubtopicModel.id == subtopic_id))
    subtopic = result.scalar_one_or_none()
    if not subtopic:
        raise HTTPException(status_code=404, detail="Subtopic not found")

    subtopic.status = status
    await session.commit()
    await session.refresh(subtopic)
    return subtopic
