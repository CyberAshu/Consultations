from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class ServiceTemplate(Base):
    __tablename__ = "service_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    default_description = Column(Text, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    default_duration = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    consultant_services = relationship("ConsultantService", back_populates="service_template")
    duration_options = relationship("ServiceDurationOption", back_populates="service_template", cascade="all, delete-orphan")


class ServiceDurationOption(Base):
    """Admin-controlled duration options for each service template"""
    __tablename__ = "service_duration_options"

    id = Column(Integer, primary_key=True, index=True)
    service_template_id = Column(Integer, ForeignKey("service_templates.id", ondelete="CASCADE"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    duration_label = Column(String(100), nullable=False)  # e.g., "30 minutes", "1 hour"
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service_template = relationship("ServiceTemplate", back_populates="duration_options")
    consultant_pricing = relationship("ConsultantServicePricing", back_populates="duration_option", cascade="all, delete-orphan")
