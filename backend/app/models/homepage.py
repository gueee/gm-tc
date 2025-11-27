"""Homepage content model for CMS."""

from sqlalchemy import Column, String, Text, JSON, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.base import Base


class HomepageContent(Base):
    """Homepage content model for CMS."""

    __tablename__ = "homepage_content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, index=True, nullable=False)  # e.g., "hero", "interests"
    content = Column(JSON, nullable=False)  # Flexible JSON structure
    is_active = Column(Boolean, default=True, nullable=False)

    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self):
        return f"<HomepageContent {self.key}>"

