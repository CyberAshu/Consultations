from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class ConsultantApplication(Base):
    __tablename__ = "consultant_applications"

    id = Column(Integer, primary_key=True, index=True)
    full_legal_name = Column(String, nullable=False)
    preferred_display_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile_phone = Column(String)
    date_of_birth = Column(Date)
    city_province = Column(String)
    time_zone = Column(String)
    rcic_license_number = Column(String, unique=True, nullable=False)
    year_of_initial_licensing = Column(Integer)
    cicc_membership_status = Column(String)
    cicc_register_screenshot_url = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

