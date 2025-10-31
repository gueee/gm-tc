"""Main FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.parts import router as parts_router
from app.api.suppliers import router as suppliers_router
from app.api.customers import router as customers_router
from app.api.builds import router as builds_router
from app.api.deliveries import router as deliveries_router
from app.api.invoices import router as invoices_router

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION
    }


# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "GM-TC CRM API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else "disabled",
    }


# Include routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(parts_router, prefix=settings.API_PREFIX)
app.include_router(suppliers_router, prefix=settings.API_PREFIX)
app.include_router(customers_router, prefix=settings.API_PREFIX)
app.include_router(builds_router, prefix=settings.API_PREFIX)
app.include_router(deliveries_router, prefix=settings.API_PREFIX)
app.include_router(invoices_router, prefix=settings.API_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
