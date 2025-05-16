from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import UniqueConstraint

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sets = relationship("Set", back_populates="owner", cascade="all, delete-orphan")
    progress = relationship("UserCardProgress", back_populates="user", cascade="all, delete-orphan")


class Set(Base):
    __tablename__ = 'sets'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="sets")
    cards = relationship("Card", back_populates="set", cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = 'cards'

    id = Column(Integer, primary_key=True, index=True)
    set_id = Column(Integer, ForeignKey('sets.id'), nullable=False)
    term = Column(String, nullable=False)
    definition = Column(Text, nullable=False)
    image_url = Column(String)
    audio_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    set = relationship("Set", back_populates="cards")
    progress = relationship("UserCardProgress", back_populates="card", cascade="all, delete-orphan")


class UserCardProgress(Base):
    __tablename__ = 'user_card_progress'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    card_id = Column(Integer, ForeignKey('cards.id'), nullable=False)
    mastery_level = Column(Integer, default=0)  # 0=unknown, 1=known
    last_studied = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="progress")
    card = relationship("Card", back_populates="progress")

    # Ensure a user can only have one progress record per card
    __table_args__ = (
        UniqueConstraint('user_id', 'card_id', name='uix_user_card'),
    )
