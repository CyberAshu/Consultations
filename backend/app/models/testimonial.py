from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from app.db.base import Base


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    quote = Column(Text, nullable=False)
    author = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    rating = Column(Float, nullable=False, default=5.0)
    flag = Column(String(10), nullable=True)
    outcome = Column(String(255), nullable=True)
    is_active = Column(String(10), nullable=False, default='true')
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
