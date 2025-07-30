from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Consultant(Base):
    __tablename__ = "consultants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    rcic_number = Column(String, unique=True, index=True, nullable=False)
    location = Column(String)
    timezone = Column(String, default="America/Toronto")
    languages = Column(JSON)  # Array of languages
    specialties = Column(JSON)  # Array of specialties
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    bio = Column(Text)
    experience = Column(String)
    success_rate = Column(String)
    calendly_url = Column(String)
    is_verified = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ConsultantService(Base):
    __tablename__ = "consultant_services"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    name = Column(String, nullable=False)
    duration = Column(String)
    price = Column(Float, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ConsultantReview(Base):
    __tablename__ = "consultant_reviews"

    id = Column(Integer, primary_key=True, index=True)
    consultant_id = Column(Integer, ForeignKey("consultants.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    outcome = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
