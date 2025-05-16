from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import SetCreate, SetResponse, SetUpdate, SetWithCards
from app.models.models import User
from app.crud import (
    create_set, get_sets_by_user, get_set_by_id, update_set, delete_set,
    get_cards_by_set
)
from app.auth import get_current_user

router = APIRouter(
    prefix="/sets",
    tags=["sets"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=SetResponse, status_code=status.HTTP_201_CREATED)
def create_new_set(
    set_data: SetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flashcard set."""
    return create_set(db, set_data, current_user.id)


@router.get("/", response_model=List[SetResponse])
def read_sets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all flashcard sets for the current user."""
    sets = get_sets_by_user(db, current_user.id, skip, limit)
    return sets


@router.get("/{set_id}", response_model=SetWithCards)
def read_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific flashcard set by ID, including its cards."""
    db_set = get_set_by_id(db, set_id, current_user.id)
    if db_set is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Set with ID {set_id} not found or you don't have access"
        )
    
    # Get the cards for this set
    cards = get_cards_by_set(db, set_id, current_user.id)
    
    # Combine set and cards
    result = SetWithCards.model_validate(db_set)
    result.cards = cards
    
    return result


@router.put("/{set_id}", response_model=SetResponse)
def update_existing_set(
    set_id: int,
    set_data: SetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a flashcard set."""
    updated_set = update_set(db, set_id, set_data, current_user.id)
    
    if updated_set is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Set with ID {set_id} not found or you don't have access"
        )
    
    return updated_set


@router.delete("/{set_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_set(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a flashcard set."""
    success = delete_set(db, set_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Set with ID {set_id} not found or you don't have access"
        )
    
    return None
