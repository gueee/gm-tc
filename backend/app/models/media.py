"""Media model for uploaded files."""

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.db.base import Base


class Media(Base):
    """Uploaded media files (images, videos, documents)."""

    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # Bytes

    # Image-specific
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    alt_text = Column(String(255), nullable=True)
    caption = Column(Text, nullable=True)

    # Variants for responsive images
    # { "thumbnail": "path", "medium": "path", "large": "path" }
    variants = Column(JSON, default=dict)

    # File metadata (EXIF data, etc.)
    file_metadata = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Media {self.filename}>"
