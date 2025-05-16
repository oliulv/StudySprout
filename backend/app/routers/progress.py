from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import ProgressCreate, ProgressResponse
from app.models.models import User
from app.crud import update_card_progress, get_user_progress, get_set_progress
from app.auth import get_current_user

router = APIRouter(
    prefix="/progress",
    tags=["progress"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=ProgressResponse)
def update_progress(
    progress_data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update progress for a flashcard."""
    progress = update_card_progress(db, progress_data, current_user.id)
    
    if progress is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with ID {progress_data.card_id} not found"
        )
    
    return progress


@router.get("/", response_model=List[ProgressResponse])
def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all progress records for the current user."""
    return get_user_progress(db, current_user.id)


@router.get("/set/{set_id}", response_model=List[ProgressResponse])
def get_progress_by_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get progress records for a specific set."""
    return get_set_progress(db, set_id, current_user.id)
