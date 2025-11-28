"""Content model for articles, projects, galleries, and reports."""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class ContentType(str, enum.Enum):
    ARTICLE = "article"
    PROJECT = "project"
    GALLERY = "gallery"
    REPORT = "report"
    SNIPPET = "snippet"


class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Content(Base):
    """
    Main content entity - articles, projects, galleries, reports, snippets.
    Uses JSON for flexible block-based content storage (TipTap format).
    """

    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)

    # Core fields
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    excerpt = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), default=ContentType.ARTICLE, index=True)
    status = Column(Enum(ContentStatus), default=ContentStatus.DRAFT, index=True)

    # Block-based content (TipTap JSON output)
    # Structure: { "type": "doc", "content": [...blocks...] }
    blocks = Column(JSON, nullable=False, default=lambda: {"type": "doc", "content": []})

    # Content-type specific data (flexible JSON)
    # For projects: { "github_url": "...", "demo_url": "...", "tech_stack": [...] }
    # For galleries: { "layout": "grid", "columns": 3 }
    # For reports: { "data_source": "...", "chart_config": {...} }
    extra_data = Column(JSON, default=dict)

    # Featured image
    featured_image_id = Column(Integer, ForeignKey("media.id"), nullable=True)

    # Category
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)

    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)

    # Publishing
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True, index=True)

    # Relationships
    category = relationship("Category", back_populates="contents")
    featured_image = relationship("Media", foreign_keys=[featured_image_id])
    tags = relationship("Tag", secondary="content_tags", back_populates="contents")

    def __repr__(self):
        return f"<Content {self.title}>"
