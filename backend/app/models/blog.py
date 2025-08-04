from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    author_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    category = Column(String, nullable=False)
    tags = Column(String)  # Comma-separated tags
    image_url = Column(String)
    read_time = Column(String)
    likes_count = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("BlogLike", back_populates="post", cascade="all, delete-orphan")

class BlogComment(Base):
    __tablename__ = "blog_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("BlogPost", back_populates="comments")

class BlogLike(Base):
    __tablename__ = "blog_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # References auth.users.id
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("BlogPost", back_populates="likes")
