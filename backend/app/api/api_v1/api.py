from fastapi import APIRouter

from .endpoints import auth, consultants, bookings, blogs, features, newsletter, consultant_applications, consultant_onboarding, users, uploads, password_reset, session_notes, events, service_templates, service_duration_options, intake, health, video_meetings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(consultants.router, prefix="/consultants", tags=["consultants"])
api_router.include_router(consultant_applications.router, prefix="/consultant-applications", tags=["consultant-applications"])
api_router.include_router(consultant_onboarding.router, prefix="/consultant-onboarding", tags=["consultant-onboarding"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(session_notes.router, prefix="/session-notes", tags=["session-notes"])
api_router.include_router(blogs.router, prefix="/blogs", tags=["blogs"])
api_router.include_router(features.router, prefix="/features", tags=["features"])
api_router.include_router(service_templates.router, prefix="/service-templates", tags=["service-templates"])
api_router.include_router(service_duration_options.router, prefix="/service-duration-options", tags=["service-duration-options"])
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["newsletter"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(password_reset.router, prefix="/password-reset", tags=["password-reset"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(intake.router, prefix="/intake", tags=["intake"])
api_router.include_router(video_meetings.router, prefix="/video", tags=["video-meetings"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
