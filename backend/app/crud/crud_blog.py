from typing import List, Optional, Dict, Any
from supabase import Client
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogCommentCreate, BlogLikeCreate
from slugify import slugify

def get_blog_post(db: Client, post_id: int) -> Optional[Dict]:
    response = db.table("blog_posts").select("*, comments:blog_comments(*)").eq("id", post_id).eq("is_published", True).execute()
    return response.data[0] if response.data else None

def get_blog_posts(db: Client, skip: int = 0, limit: int = 10, category: str = None) -> List[Dict]:
    query = db.table("blog_posts").select("*, comments:blog_comments(*)").eq("is_published", True)
    
    if category:
        query = query.eq("category", category)
    
    response = query.range(skip, skip + limit - 1).order("created_at", desc=True).execute()
    return response.data

def create_blog_post(db: Client, *, obj_in: BlogPostCreate) -> Dict:
    post_data = obj_in.dict()
    post_data["slug"] = slugify(obj_in.title)
    
    response = db.table("blog_posts").insert(post_data).execute()
    return response.data[0]

def update_blog_post(db: Client, *, post_id: int, obj_in: BlogPostUpdate) -> Dict:
    update_data = obj_in.dict(exclude_unset=True)
    if "title" in update_data:
        update_data["slug"] = slugify(update_data["title"])
    
    response = db.table("blog_posts").update(update_data).eq("id", post_id).execute()
    return response.data[0]

def create_blog_comment(db: Client, *, obj_in: BlogCommentCreate) -> Dict:
    response = db.table("blog_comments").insert(obj_in.dict()).execute()
    return response.data[0]

def like_blog_post(db: Client, *, obj_in: BlogLikeCreate) -> Dict:
    # Check if already liked
    existing_like = db.table("blog_likes").select("*").eq("post_id", obj_in.post_id).eq("user_id", obj_in.user_id).execute()
    
    if existing_like.data:
        # Unlike (remove like)
        db.table("blog_likes").delete().eq("post_id", obj_in.post_id).eq("user_id", obj_in.user_id).execute()
        # Decrease likes count
        db.rpc("decrement_likes", {"post_id": obj_in.post_id}).execute()
        return {"liked": False}
    else:
        # Add like
        db.table("blog_likes").insert(obj_in.dict()).execute()
        # Increase likes count
        db.rpc("increment_likes", {"post_id": obj_in.post_id}).execute()
        return {"liked": True}

def search_blog_posts(db: Client, query: str) -> List[Dict]:
    response = db.table("blog_posts").select("*").text_search("title,content", query).eq("is_published", True).execute()
    return response.data
