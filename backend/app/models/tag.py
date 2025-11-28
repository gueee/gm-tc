"""Tag model for cross-category content organization."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


# Association table for many-to-many Content <-> Tag relationship
content_tags = Table(
    "content_tags",
    Base.metadata,
    Column("content_id", Integer, ForeignKey("contents.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class Tag(Base):
    """Tags for cross-category content organization."""

    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    contents = relationship("Content", secondary=content_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag {self.name}>"
