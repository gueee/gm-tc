"""Content schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.content import ContentType, ContentStatus


class ContentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = None
    content_type: ContentType = ContentType.ARTICLE
    blocks: Dict[str, Any] = Field(default_factory=lambda: {"type": "doc", "content": []})
    extra_data: Dict[str, Any] = Field(default_factory=dict)
    category_id: Optional[int] = None
    featured_image_id: Optional[int] = None
    is_featured: bool = False
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    excerpt: Optional[str] = None
    content_type: Optional[ContentType] = None
    status: Optional[ContentStatus] = None
    blocks: Optional[Dict[str, Any]] = None
    extra_data: Optional[Dict[str, Any]] = None
    category_id: Optional[int] = None
    featured_image_id: Optional[int] = None
    is_featured: Optional[bool] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class CategoryBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str


class ContentResponse(ContentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ContentStatus
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    category: Optional[CategoryBrief] = None
    tags: List[TagResponse] = []


class ContentListItem(BaseModel):
    """Simplified content for list views."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    content_type: ContentType
    status: ContentStatus
    is_featured: bool
    view_count: int
    created_at: datetime
    published_at: Optional[datetime] = None
    category: Optional[CategoryBrief] = None


class ContentListResponse(BaseModel):
    items: List[ContentListItem]
    total: int
    page: int
    limit: int
    pages: int
