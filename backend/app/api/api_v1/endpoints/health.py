from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("")
@router.get("/")
def health_check():
    """Simple health endpoint for liveness checks.
    Supports both /health and /health/ (no redirects).
    """
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": settings.API_V1_STR,
        "time": datetime.now(timezone.utc).isoformat(),
    }
