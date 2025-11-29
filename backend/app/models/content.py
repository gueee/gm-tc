"""
Content models: Categories, Contents (articles), Tags, Media.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON

from app.db.session import Base


# Many-to-many relationship table for Content <-> Tags
content_tags = Table(
    "content_tags",
    Base.metadata,
    Column("content_id", Integer, ForeignKey("contents.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Lucide icon name
    color = Column(String(7), nullable=True)  # Hex color
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)

    # Relationships
    contents = relationship("Content", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    contents = relationship("Content", secondary=content_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Media {self.filename}>"


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=True)  # Markdown content OR empty for embedded components
    content_type = Column(String(20), default="article")  # 'article', 'page', 'project'
    status = Column(String(20), default="draft")  # 'draft', 'published'
    blocks = Column(JSON, nullable=True)  # For block-based content
    extra_data = Column(JSON, nullable=True)
    featured_image_id = Column(Integer, ForeignKey("media.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    category = relationship("Category", back_populates="contents")
    featured_image = relationship("Media")
    tags = relationship("Tag", secondary=content_tags, back_populates="contents")

    def __repr__(self):
        return f"<Content {self.title}>"



