"""Blog post model for CMS."""

from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.base import Base


class BlogPost(Base):
    """Blog post model for CMS."""

    __tablename__ = "blog_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(500), nullable=True)
    featured_image = Column(String(500), nullable=True)
    published = Column(Boolean, default=False, nullable=False, index=True)
    published_at = Column(DateTime, nullable=True)
    
    # Foreign key to User
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<BlogPost {self.slug}: {self.title}>"

