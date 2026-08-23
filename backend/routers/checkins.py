from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend.database import get_async_session
from backend.models.checkin import DailyCheckInModel
from backend.schemas.checkin import DailyCheckInCreate, DailyCheckInResponse
from backend.routers.auth import get_current_user
from backend.models.user import UserModel

router = APIRouter(prefix="/checkins", tags=["Daily Check-Ins"])

@router.post("", response_model=DailyCheckInResponse)
async def create_checkin(
    checkin_in: DailyCheckInCreate,
    session: AsyncSession = Depends(get_async_session),
    user: UserModel = Depends(get_current_user)
):
    chk_id = f"chk_{int(datetime.utcnow().timestamp())}" if 'datetime' in locals() else "chk_new"
    new_chk = DailyCheckInModel(
        id=chk_id,
        user_id=user.id,
        **checkin_in.dict()
    )
    user.streak += 1
    session.add(new_chk)
    await session.commit()
    await session.refresh(new_chk)
    return new_chk

@router.get("", response_model=List[DailyCheckInResponse])
async def list_user_checkins(
    session: AsyncSession = Depends(get_async_session),
    user: UserModel = Depends(get_current_user)
):
    result = await session.execute(
        select(DailyCheckInModel).where(DailyCheckInModel.user_id == user.id).order_by(DailyCheckInModel.created_at.desc())
    )
    return result.scalars().all()
