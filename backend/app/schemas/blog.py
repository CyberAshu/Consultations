from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Blog Comment Schemas
class BlogCommentBase(BaseModel):
    content: str

class BlogCommentCreate(BlogCommentBase):
    post_id: int
    author_id: int

class BlogCommentInDB(BlogCommentBase):
    id: int
    post_id: int
    author_id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Blog Post Schemas
class BlogPostBase(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category: str
    tags: Optional[str] = None
    image_url: Optional[str] = None
    read_time: Optional[str] = None
    is_published: bool = False

class BlogPostCreate(BlogPostBase):
    author_id: int

class BlogPostUpdate(BlogPostBase):
    pass

class BlogPostInDB(BlogPostBase):
    id: int
    slug: str
    author_id: int
    likes_count: int
    comments: List[BlogCommentInDB] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Blog Like Schema
class BlogLikeCreate(BaseModel):
    post_id: int
    user_id: int
