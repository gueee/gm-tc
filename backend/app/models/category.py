"""Category model for dynamic navigation."""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Category(Base):
    """
    Dynamic categories that serve as primary navigation.
    Examples: 3D Printing, Programming, Electronics, FPV Drones, etc.
    """

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Lucide icon name
    color = Column(String(7), nullable=True)  # Hex color for accent
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contents = relationship("Content", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"
