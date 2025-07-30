from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from pydantic import BaseModel, EmailStr

from app.api import deps

router = APIRouter()

class NewsletterSubscription(BaseModel):
    email: EmailStr

@router.post("/subscribe")
def subscribe_newsletter(
    *,
    db: Client = Depends(deps.get_db),
    subscription: NewsletterSubscription
) -> Any:
    """
    Subscribe to newsletter.
    """
    try:
        # Check if email already exists
        existing = db.table("newsletter_subscriptions").select("email").eq("email", subscription.email).execute()
        
        if existing.data:
            return {"message": "Email already subscribed", "status": "already_subscribed"}
        
        # Insert new subscription
        result = db.table("newsletter_subscriptions").insert({
            "email": subscription.email,
            "subscribed_at": "now()",
            "status": "active"
        }).execute()
        
        return {"message": "Successfully subscribed to newsletter", "status": "subscribed"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Newsletter subscription failed: {str(e)}"
        )

@router.post("/unsubscribe")
def unsubscribe_newsletter(
    *,
    db: Client = Depends(deps.get_db),
    subscription: NewsletterSubscription
) -> Any:
    """
    Unsubscribe from newsletter.
    """
    try:
        # Update subscription status
        result = db.table("newsletter_subscriptions").update({
            "status": "unsubscribed",
            "unsubscribed_at": "now()"
        }).eq("email", subscription.email).execute()
        
        return {"message": "Successfully unsubscribed from newsletter", "status": "unsubscribed"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Newsletter unsubscription failed: {str(e)}"
        )
