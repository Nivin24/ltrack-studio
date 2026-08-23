from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from backend.database import get_async_session
from backend.models.assignment import AssignmentModel, SubmissionModel, EvaluationModel
from backend.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    SubmissionCreate,
    SubmissionResponse,
    EvaluationCreate,
    EvaluationResponse
)
from backend.routers.auth import get_current_user, get_current_admin
from backend.models.user import UserModel

router = APIRouter(prefix="/assignments", tags=["Assignments & Evaluation"])

@router.get("", response_model=List[AssignmentResponse])
async def list_assignments(
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(AssignmentModel))
    return result.scalars().all()

@router.post("", response_model=AssignmentResponse)
async def create_assignment(
    asgn_in: AssignmentCreate,
    session: AsyncSession = Depends(get_async_session),
    admin: UserModel = Depends(get_current_admin)
):
    asgn_id = f"asgn_{int(datetime.utcnow().timestamp())}" if 'datetime' in locals() else "asgn_new"
    new_asgn = AssignmentModel(
        id=asgn_id,
        **asgn_in.dict()
    )
    session.add(new_asgn)
    await session.commit()
    await session.refresh(new_asgn)
    return new_asgn

@router.post("/{assignment_id}/submissions", response_model=SubmissionResponse)
async def submit_assignment(
    assignment_id: str,
    sub_in: SubmissionCreate,
    session: AsyncSession = Depends(get_async_session),
    user: UserModel = Depends(get_current_user)
):
    sub_id = f"subm_{int(datetime.utcnow().timestamp())}" if 'datetime' in locals() else "subm_new"
    new_sub = SubmissionModel(
        id=sub_id,
        assignment_id=assignment_id,
        user_id=user.id,
        github_pr=sub_in.github_pr,
        branch=sub_in.branch,
        notes=sub_in.notes,
        code_snippet=sub_in.code_snippet,
        status="submitted"
    )
    session.add(new_sub)
    await session.commit()
    await session.refresh(new_sub)
    return new_sub

@router.post("/submissions/{submission_id}/evaluate", response_model=EvaluationResponse)
async def evaluate_submission(
    submission_id: str,
    eval_in: EvaluationCreate,
    session: AsyncSession = Depends(get_async_session),
    admin: UserModel = Depends(get_current_admin)
):
    result = await session.execute(select(SubmissionModel).where(SubmissionModel.id == submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    overall = round((eval_in.code_quality + eval_in.understanding + eval_in.testing + eval_in.documentation) / 4.0, 1)

    eval_id = f"eval_{int(datetime.utcnow().timestamp())}" if 'datetime' in locals() else "eval_new"
    new_eval = EvaluationModel(
        id=eval_id,
        submission_id=submission_id,
        code_quality=eval_in.code_quality,
        understanding=eval_in.understanding,
        testing=eval_in.testing,
        documentation=eval_in.documentation,
        overall_score=overall,
        feedback=eval_in.feedback,
        graded_by=admin.name
    )
    sub.status = "evaluated"
    session.add(new_eval)
    await session.commit()
    await session.refresh(new_eval)
    return new_eval
