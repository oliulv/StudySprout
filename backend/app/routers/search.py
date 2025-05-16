from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import SearchQuery, SetResponse
from app.crud import search_public_sets

router = APIRouter(
    prefix="/search",
    tags=["search"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[SetResponse])
def search_sets(
    q: str = Query(..., description="Search query for finding sets by title or description"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Search for public flashcard sets by title or description.
    This endpoint is public and does not require authentication.
    """
    return search_public_sets(db, q, skip, limit)
