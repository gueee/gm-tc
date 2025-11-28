"""
Content schemas for API requests/responses.
"""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


# Category schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CategoryBrief(BaseModel):
    """Brief category info for content responses."""
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


# Tag schemas
class TagBase(BaseModel):
    name: str
    slug: str


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Content schemas
class ContentBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = "article"
    status: Optional[str] = "draft"
    blocks: Optional[dict] = None
    extra_data: Optional[dict] = None
    category_id: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: Optional[bool] = False


class ContentCreate(ContentBase):
    pass


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[str] = None
    status: Optional[str] = None
    blocks: Optional[dict] = None
    extra_data: Optional[dict] = None
    category_id: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_featured: Optional[bool] = None


class ContentResponse(ContentBase):
    id: int
    view_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    category: Optional[CategoryBrief] = None

    class Config:
        from_attributes = True


class ContentListResponse(BaseModel):
    """Paginated list of content items."""
    items: List[ContentResponse]
    total: int
    page: int
    limit: int
    pages: int

