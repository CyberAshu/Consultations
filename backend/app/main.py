from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import json

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.services.storage_service import storage_service

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Custom handler for validation errors to help with debugging"""
    print(f"VALIDATION ERROR: Request URL: {request.url}")
    print(f"VALIDATION ERROR: Method: {request.method}")
    try:
        body = await request.body()
        print(f"VALIDATION ERROR: Request body: {body.decode('utf-8')}")
    except:
        print("VALIDATION ERROR: Could not read request body")
    print(f"VALIDATION ERROR: Details: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": "Validation failed"}
    )

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("Starting up application...")
    # Create storage bucket if it doesn't exist
    storage_service.create_bucket_if_not_exists()
    print("Application startup complete.")

app.include_router(api_router, prefix=settings.API_V1_STR)
