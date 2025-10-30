"""Database models package."""

# Import all models here for Alembic to detect them
from app.db.base import Base

__all__ = ["Base"]
