from fastapi import APIRouter

from .endpoints import auth, consultants, bookings, blogs, features, newsletter

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(consultants.router, prefix="/consultants", tags=["consultants"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["blogs"])
api_router.include_router(features.router, prefix="/features", tags=["features"])
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["newsletter"])
