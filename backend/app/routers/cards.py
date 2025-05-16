from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import CardCreate, CardResponse, CardUpdate
from app.models.models import User
from app.crud import (
    create_card, get_cards_by_set, get_card_by_id,
    update_card, delete_card
)
from app.auth import get_current_user

router = APIRouter(
    prefix="/sets/{set_id}/cards",
    tags=["cards"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_new_card(
    set_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new flashcard within a set."""
    db_card = create_card(db, card_data, set_id, current_user.id)
    
    if db_card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Set with ID {set_id} not found or you don't have access"
        )
    
    return db_card


@router.get("/", response_model=List[CardResponse])
def read_cards(
    set_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all flashcards for a set."""
    cards = get_cards_by_set(db, set_id, current_user.id)
    return cards


@router.get("/{card_id}", response_model=CardResponse)
def read_card(
    set_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific flashcard by ID."""
    card = get_card_by_id(db, card_id, set_id, current_user.id)
    
    if card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with ID {card_id} not found or you don't have access"
        )
    
    return card


@router.put("/{card_id}", response_model=CardResponse)
def update_existing_card(
    set_id: int,
    card_id: int,
    card_data: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a flashcard."""
    updated_card = update_card(db, card_id, set_id, card_data, current_user.id)
    
    if updated_card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with ID {card_id} not found or you don't have access"
        )
    
    return updated_card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_card(
    set_id: int,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a flashcard."""
    success = delete_card(db, card_id, set_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with ID {card_id} not found or you don't have access"
        )
    
    return None
