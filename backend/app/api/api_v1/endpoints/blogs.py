from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.api import deps
from app.crud import crud_blog
from app.schemas.blog import BlogPostInDB, BlogPostCreate, BlogPostUpdate, BlogCommentCreate, BlogLikeCreate

router = APIRouter()

@router.get("/", response_model=List[BlogPostInDB])
def read_blog_posts(
    db: Client = Depends(deps.get_db),
    skip: int = 0,
    limit: int = Query(default=10, le=100),
    category: str = None,
) -> Any:
    """
    Retrieve blog posts.
    """
    posts = crud_blog.get_blog_posts(db, skip=skip, limit=limit, category=category)
    return posts

@router.get("/search", response_model=List[BlogPostInDB])
def search_blog_posts(
    query: str,
    db: Client = Depends(deps.get_db),
) -> Any:
    """
    Search blog posts.
    """
    posts = crud_blog.search_blog_posts(db, query=query)
    return posts

@router.get("/{post_id}", response_model=BlogPostInDB)
def read_blog_post(
    *,
    db: Client = Depends(deps.get_db),
    post_id: int,
) -> Any:
    """
    Get blog post by ID.
    """
    post = crud_blog.get_blog_post(db=db, post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post

@router.post("/", response_model=BlogPostInDB)
def create_blog_post(
    *,
    db: Client = Depends(deps.get_db),
    post_in: BlogPostCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new blog post.
    """
    # Only admin users can create blog posts
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    post_in.author_id = current_user["id"]
    post = crud_blog.create_blog_post(db=db, obj_in=post_in)
    return post

@router.put("/{post_id}", response_model=BlogPostInDB)
def update_blog_post(
    *,
    db: Client = Depends(deps.get_db),
    post_id: int,
    post_in: BlogPostUpdate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update blog post.
    """
    # Only admin users can update blog posts
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    post = crud_blog.update_blog_post(db=db, post_id=post_id, obj_in=post_in)
    return post

@router.post("/{post_id}/comments")
def create_blog_comment(
    *,
    db: Client = Depends(deps.get_db),
    post_id: int,
    comment_in: BlogCommentCreate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create comment for blog post.
    """
    comment_data = comment_in.dict()
    comment_data["post_id"] = post_id
    comment_data["author_id"] = current_user["id"]
    
    comment = crud_blog.create_blog_comment(db=db, obj_in=comment_data)
    return comment

@router.post("/{post_id}/like")
def like_blog_post(
    *,
    db: Client = Depends(deps.get_db),
    post_id: int,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Like or unlike blog post.
    """
    like_data = BlogLikeCreate(post_id=post_id, user_id=current_user["id"])
    result = crud_blog.like_blog_post(db=db, obj_in=like_data)
    return result

@router.get("/categories", response_model=List[dict])
def read_blog_categories(
    db: Client = Depends(deps.get_db),
) -> Any:
    """
    Retrieve blog categories with post counts.
    """
    # Mock implementation - in production, you would query your database
    categories = [
        {"name": "Immigration Policy", "count": 8},
        {"name": "Study Permits", "count": 5},
        {"name": "Express Entry", "count": 12},
        {"name": "Work Permits", "count": 6},
        {"name": "Family Sponsorship", "count": 4}
    ]
    return categories

@router.get("/recent", response_model=List[dict])
def read_recent_posts(
    db: Client = Depends(deps.get_db),
    limit: int = Query(default=5, le=10),
) -> Any:
    """
    Retrieve recent blog posts.
    """
    # Mock implementation - in production, you would query your database
    recent_posts = [
        "Understanding Canadian Immigration Policies in 2024",
        "Study Permit Applications: Tips for Success",
        "Express Entry Updates: What Changed in 2024",
        "Work Permit Guide for International Students",
        "Family Class Immigration: Complete Guide"
    ]
    return [{"title": title, "slug": title.lower().replace(" ", "-")} for title in recent_posts[:limit]]
