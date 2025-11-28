"""Category schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_active: bool = True
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    slug: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = None


class CategoryResponse(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sort_order: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class CategoryListResponse(BaseModel):
    items: List[CategoryResponse]
    total: int


class CategoryReorder(BaseModel):
    """Schema for reordering categories."""
    category_ids: List[int] = Field(..., description="List of category IDs in desired order")
