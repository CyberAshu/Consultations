from typing import Any, Dict, Optional, Union, List
from supabase import Client
from gotrue.errors import AuthApiError


def get_user_by_id(db: Client, *, user_id: str) -> Optional[Dict]:
    """
    Get user by ID from Supabase Auth
    """
    try:
        # Using admin client to get user by ID
        user_response = db.auth.admin.get_user_by_id(user_id)
        if user_response.user:
            user = user_response.user
            return {
                "id": user.id,
                "email": user.email,
                "full_name": user.user_metadata.get("full_name"),
                "role": user.user_metadata.get("role", "client"),
                "email_verified": user.email_confirmed_at is not None,
                "is_active": True,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
    except Exception:
        pass
    return None


def get_user_by_email(db: Client, *, email: str) -> Optional[Dict]:
    """
    Get user by email from Supabase Auth
    """
    try:
        # Using admin client to get user by email
        users_response = db.auth.admin.list_users()
        if users_response.users:
            for user in users_response.users:
                if user.email == email:
                    return {
                        "id": user.id,
                        "email": user.email,
                        "full_name": user.user_metadata.get("full_name"),
                        "role": user.user_metadata.get("role", "client"),
                        "email_verified": user.email_confirmed_at is not None,
                        "is_active": True,
                        "created_at": user.created_at,
                        "updated_at": user.updated_at
                    }
    except Exception:
        pass
    return None


def update_user_metadata(db: Client, *, user_id: str, metadata: Dict[str, Any]) -> Optional[Dict]:
    """
    Update user metadata in Supabase Auth
    """
    try:
        user_response = db.auth.admin.update_user_by_id(
            user_id,
            {
                "user_metadata": metadata
            }
        )
        if user_response.user:
            user = user_response.user
            return {
                "id": user.id,
                "email": user.email,
                "full_name": user.user_metadata.get("full_name"),
                "role": user.user_metadata.get("role", "client"),
                "email_verified": user.email_confirmed_at is not None,
                "is_active": True,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
    except Exception:
        pass
    return None


def list_users(db: Client, *, page: int = 1, per_page: int = 10) -> List[Dict]:
    """
    List users from Supabase Auth
    """
    try:
        users_response = db.auth.admin.list_users(page=page, per_page=per_page)
        if users_response.users:
            return [
                {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.user_metadata.get("full_name"),
                    "role": user.user_metadata.get("role", "client"),
                    "email_verified": user.email_confirmed_at is not None,
                    "is_active": True,
                    "created_at": user.created_at,
                    "updated_at": user.updated_at
                }
                for user in users_response.users
            ]
    except Exception:
        pass
    return []
