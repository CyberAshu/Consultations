from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.api import deps
from app.schemas.user import UserInDB, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserInDB])
def read_users(
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    role: str = Query(None),
) -> Any:
    """
    Retrieve users. Only accessible by admin users.
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Get users from Supabase Auth
        users_response = db.auth.admin.list_users()
        users = []
        
        for user in users_response:
            user_data = {
                "id": user.id,
                "email": user.email,
                "full_name": user.user_metadata.get("full_name"),
                "role": user.user_metadata.get("role", "client"),
                "email_verified": user.email_confirmed_at is not None,
                "is_active": not user.banned_until,
                "created_at": user.created_at,
                "last_sign_in": user.last_sign_in_at
            }
            
            # Filter by role if specified
            if role and user_data["role"] != role:
                continue
                
            users.append(user_data)
        
        # Apply pagination
        return users[skip:skip + limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve users: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserInDB)
def read_user(
    *,
    db: Client = Depends(deps.get_db),
    user_id: str,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get user by ID. Users can only view their own profile unless they are admin.
    """
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Get user from Supabase Auth
        user_response = db.auth.admin.get_user_by_id(user_id)
        
        if not user_response.user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = user_response.user
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name"),
            "role": user.user_metadata.get("role", "client"),
            "email_verified": user.email_confirmed_at is not None,
            "is_active": not user.banned_until,
            "created_at": user.created_at,
            "last_sign_in": user.last_sign_in_at
        }
        
        # If user is RCIC, add consultant profile data
        if user_data["role"] == "rcic":
            try:
                consultant_response = db.table("consultants").select("*").eq("user_id", user_id).execute()
                if consultant_response.data:
                    user_data["consultant_profile"] = consultant_response.data[0]
            except:
                pass  # Consultant profile not found, ignore
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve user: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserInDB)
def update_user(
    *,
    db: Client = Depends(deps.get_db),
    user_id: str,
    user_in: UserUpdate,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update user. Users can only update their own profile unless they are admin.
    """
    if current_user["role"] != "admin" and current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Update user metadata in Supabase Auth
        update_data = {}
        if user_in.full_name is not None:
            update_data["full_name"] = user_in.full_name
        if user_in.role is not None and current_user["role"] == "admin":
            update_data["role"] = user_in.role
        
        if update_data:
            db.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": update_data}
            )
        
        # Get updated user data
        return read_user(db=db, user_id=user_id, current_user=current_user)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/{user_id}")
def delete_user(
    *,
    db: Client = Depends(deps.get_db),
    user_id: str,
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete user. Only accessible by admin users.
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        # Delete user from Supabase Auth
        db.auth.admin.delete_user(user_id)
        return {"message": "User deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Client = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard statistics based on user role.
    """
    try:
        if current_user["role"] == "admin":
            # Admin dashboard stats
            users_response = db.auth.admin.list_users()
            total_users = len(users_response)
            
            # Count users by role
            roles_count = {"admin": 0, "client": 0, "rcic": 0}
            for user in users_response:
                role = user.user_metadata.get("role", "client")
                roles_count[role] = roles_count.get(role, 0) + 1
            
            # Get consultants count
            consultants_response = db.table("consultants").select("id", count="exact").execute()
            total_consultants = consultants_response.count
            
            # Get bookings count
            bookings_response = db.table("bookings").select("id", count="exact").execute()
            total_bookings = bookings_response.count
            
            # Get recent bookings
            recent_bookings = db.table("bookings").select("*, consultants(name)").order("created_at", desc=True).limit(5).execute()
            
            return {
                "total_users": total_users,
                "total_consultants": total_consultants,
                "total_bookings": total_bookings,
                "roles_distribution": roles_count,
                "recent_bookings": recent_bookings.data
            }
            
        elif current_user["role"] == "rcic":
            # RCIC dashboard stats
            consultant_response = db.table("consultants").select("id").eq("user_id", current_user["id"]).execute()
            if not consultant_response.data:
                raise HTTPException(status_code=404, detail="Consultant profile not found")
            
            consultant_id = consultant_response.data[0]["id"]
            
            # Get bookings for this consultant
            bookings_response = db.table("bookings").select("*", count="exact").eq("consultant_id", consultant_id).execute()
            
            # Get upcoming bookings
            upcoming_bookings = db.table("bookings").select("*").eq("consultant_id", consultant_id).eq("status", "confirmed").order("booking_date", desc=False).limit(5).execute()
            
            # Get recent reviews
            reviews_response = db.table("consultant_reviews").select("*", count="exact").eq("consultant_id", consultant_id).execute()
            
            return {
                "total_bookings": bookings_response.count,
                "upcoming_bookings": upcoming_bookings.data,
                "total_reviews": reviews_response.count,
                "average_rating": 4.5  # Calculate from reviews
            }
            
        else:
            # Client dashboard stats
            bookings_response = db.table("bookings").select("*", count="exact").eq("client_id", current_user["id"]).execute()
            
            # Get recent bookings
            recent_bookings = db.table("bookings").select("*, consultants(name)").eq("client_id", current_user["id"]).order("created_at", desc=True).limit(5).execute()
            
            return {
                "total_bookings": bookings_response.count,
                "recent_bookings": recent_bookings.data
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get dashboard stats: {str(e)}"
        )
