from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Set, Card, UserCardProgress
from app.schemas import UserCreate, SetCreate, SetUpdate, CardCreate, CardUpdate, ProgressCreate
from app.auth import get_password_hash


# User CRUD operations
def create_user(db: Session, user: UserCreate):
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


# Set CRUD operations
def create_set(db: Session, set_data: SetCreate, user_id: int):
    """Create a new flashcard set."""
    db_set = Set(
        title=set_data.title,
        description=set_data.description,
        is_public=set_data.is_public,
        user_id=user_id
    )
    db.add(db_set)
    db.commit()
    db.refresh(db_set)
    return db_set


def get_sets_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all flashcard sets for a user."""
    sets = db.query(Set).filter(Set.user_id == user_id).offset(skip).limit(limit).all()
    
    # Count cards for each set
    for s in sets:
        s.card_count = db.query(func.count(Card.id)).filter(Card.set_id == s.id).scalar()
    
    return sets


def get_set_by_id(db: Session, set_id: int, user_id: int = None):
    """
    Get a flashcard set by ID.
    If user_id is provided, check if user owns the set or the set is public.
    """
    query = db.query(Set).filter(Set.id == set_id)
    
    if user_id:
        # User can access their own sets or public sets
        set_item = query.filter((Set.user_id == user_id) | (Set.is_public == True)).first()
    else:
        # Only public sets are accessible if no user_id
        set_item = query.filter(Set.is_public == True).first()
    
    if set_item:
        set_item.card_count = db.query(func.count(Card.id)).filter(Card.set_id == set_item.id).scalar()
    
    return set_item


def update_set(db: Session, set_id: int, set_data: SetUpdate, user_id: int):
    """Update a flashcard set."""
    db_set = db.query(Set).filter(Set.id == set_id, Set.user_id == user_id).first()
    
    if db_set:
        # Update only the fields that were provided
        if set_data.title is not None:
            db_set.title = set_data.title
        if set_data.description is not None:
            db_set.description = set_data.description
        if set_data.is_public is not None:
            db_set.is_public = set_data.is_public
        
        db.commit()
        db.refresh(db_set)
    
    return db_set


def delete_set(db: Session, set_id: int, user_id: int):
    """Delete a flashcard set."""
    db_set = db.query(Set).filter(Set.id == set_id, Set.user_id == user_id).first()
    
    if db_set:
        db.delete(db_set)
        db.commit()
        return True
    
    return False


def search_public_sets(db: Session, query: str, skip: int = 0, limit: int = 20):
    """Search for public flashcard sets by title or description."""
    search = f"%{query}%"
    sets = (
        db.query(Set)
        .filter(Set.is_public == True)
        .filter((Set.title.ilike(search)) | (Set.description.ilike(search)))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # Count cards for each set
    for s in sets:
        s.card_count = db.query(func.count(Card.id)).filter(Card.set_id == s.id).scalar()
    
    return sets


# Card CRUD operations
def create_card(db: Session, card: CardCreate, set_id: int, user_id: int):
    """Create a new flashcard."""
    # Verify that the set belongs to the user
    db_set = db.query(Set).filter(Set.id == set_id, Set.user_id == user_id).first()
    
    if not db_set:
        return None
    
    db_card = Card(
        set_id=set_id,
        term=card.term,
        definition=card.definition,
        image_url=card.image_url,
        audio_url=card.audio_url
    )
    
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    
    return db_card


def get_cards_by_set(db: Session, set_id: int, user_id: int = None):
    """
    Get all flashcards for a set.
    If user_id is provided, check if user owns the set or the set is public.
    """
    # First check if the set exists and is accessible to the user
    set_item = get_set_by_id(db, set_id, user_id)
    
    if not set_item:
        return []
    
    return db.query(Card).filter(Card.set_id == set_id).all()


def get_card_by_id(db: Session, card_id: int, set_id: int, user_id: int = None):
    """
    Get a flashcard by ID.
    If user_id is provided, check if user owns the set or the set is public.
    """
    # First check if the set exists and is accessible to the user
    set_item = get_set_by_id(db, set_id, user_id)
    
    if not set_item:
        return None
    
    return db.query(Card).filter(Card.id == card_id, Card.set_id == set_id).first()


def update_card(db: Session, card_id: int, set_id: int, card_data: CardUpdate, user_id: int):
    """Update a flashcard."""
    # Verify that the set belongs to the user
    db_set = db.query(Set).filter(Set.id == set_id, Set.user_id == user_id).first()
    
    if not db_set:
        return None
    
    db_card = db.query(Card).filter(Card.id == card_id, Card.set_id == set_id).first()
    
    if db_card:
        # Update only the fields that were provided
        if card_data.term is not None:
            db_card.term = card_data.term
        if card_data.definition is not None:
            db_card.definition = card_data.definition
        if card_data.image_url is not None:
            db_card.image_url = card_data.image_url
        if card_data.audio_url is not None:
            db_card.audio_url = card_data.audio_url
        
        db.commit()
        db.refresh(db_card)
    
    return db_card


def delete_card(db: Session, card_id: int, set_id: int, user_id: int):
    """Delete a flashcard."""
    # Verify that the set belongs to the user
    db_set = db.query(Set).filter(Set.id == set_id, Set.user_id == user_id).first()
    
    if not db_set:
        return False
    
    db_card = db.query(Card).filter(Card.id == card_id, Card.set_id == set_id).first()
    
    if db_card:
        db.delete(db_card)
        db.commit()
        return True
    
    return False


# Progress CRUD operations
def update_card_progress(db: Session, progress_data: ProgressCreate, user_id: int):
    """Update the progress status for a flashcard."""
    # Check if the card exists
    card = db.query(Card).filter(Card.id == progress_data.card_id).first()
    
    if not card:
        return None
    
    # Check if progress already exists
    progress = (
        db.query(UserCardProgress)
        .filter(UserCardProgress.user_id == user_id, UserCardProgress.card_id == progress_data.card_id)
        .first()
    )
    
    if progress:
        # Update existing progress
        progress.mastery_level = progress_data.mastery_level
    else:
        # Create new progress record
        progress = UserCardProgress(
            user_id=user_id,
            card_id=progress_data.card_id,
            mastery_level=progress_data.mastery_level
        )
        db.add(progress)
    
    db.commit()
    db.refresh(progress)
    return progress


def get_user_progress(db: Session, user_id: int):
    """Get all progress records for a user."""
    return db.query(UserCardProgress).filter(UserCardProgress.user_id == user_id).all()


def get_set_progress(db: Session, set_id: int, user_id: int):
    """Get all progress records for a specific set and user."""
    cards = db.query(Card).filter(Card.set_id == set_id).all()
    card_ids = [card.id for card in cards]
    
    return (
        db.query(UserCardProgress)
        .filter(UserCardProgress.user_id == user_id, UserCardProgress.card_id.in_(card_ids))
        .all()
    )
