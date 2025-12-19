"""
GM-TC CMS - FastAPI Application Entry Point
"""
import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers
from app.api.auth import router as auth_router
from app.api.content import router as content_router
from app.api.homepage import router as homepage_router
from app.api.media import router as media_router

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(content_router, prefix=settings.API_PREFIX)
app.include_router(homepage_router, prefix=settings.API_PREFIX)
app.include_router(media_router, prefix=settings.API_PREFIX)

# Mount uploads directory for static file serving
# Create directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# Custom exception handler for validation errors - logs details
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error on {request.method} {request.url}")
    logger.error(f"Errors: {exc.errors()}")
    # Try to log body size
    body = await request.body()
    logger.error(f"Request body size: {len(body)} bytes")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "name": settings.APP_NAME,
        "status": "running",
        "api_docs": f"{settings.API_PREFIX}/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

