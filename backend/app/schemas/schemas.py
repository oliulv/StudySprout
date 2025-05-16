from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# Set schemas
class SetBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = False

class SetCreate(SetBase):
    pass

class SetUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class SetResponse(SetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    card_count: Optional[int] = 0

    class Config:
        from_attributes = True


# Card schemas
class CardBase(BaseModel):
    term: str
    definition: str
    image_url: Optional[str] = None
    audio_url: Optional[str] = None

class CardCreate(CardBase):
    pass

class CardUpdate(BaseModel):
    term: Optional[str] = None
    definition: Optional[str] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None

class CardResponse(CardBase):
    id: int
    set_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Progress schemas
class ProgressBase(BaseModel):
    mastery_level: int

class ProgressCreate(ProgressBase):
    card_id: int

class ProgressResponse(ProgressBase):
    id: int
    user_id: int
    card_id: int
    last_studied: datetime
    
    class Config:
        from_attributes = True


# Set with cards included
class SetWithCards(SetResponse):
    cards: List[CardResponse] = []
    
    class Config:
        from_attributes = True


# Search schemas
class SearchQuery(BaseModel):
    query: str
