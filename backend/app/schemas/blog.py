"""Blog post schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
import re


class BlogPostBase(BaseModel):
    """Base blog post schema with common attributes."""

    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    featured_image: Optional[str] = Field(None, max_length=500)
    published: bool = Field(default=False)


class BlogPostCreate(BlogPostBase):
    """Schema for creating a new blog post."""

    pass


class BlogPostUpdate(BaseModel):
    """Schema for updating a blog post."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = Field(None, max_length=500)
    featured_image: Optional[str] = Field(None, max_length=500)
    published: Optional[bool] = None


class BlogPostInDB(BlogPostBase):
    """Schema for blog post in database."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    author_id: UUID
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class BlogPost(BlogPostInDB):
    """Schema for blog post response."""

    pass


class BlogPostList(BaseModel):
    """Schema for paginated blog post list response."""

    items: list[BlogPost]
    total: int
    page: int
    per_page: int
    total_pages: int

