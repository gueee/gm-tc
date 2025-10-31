"""Build schemas for request/response validation."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class BuildPartCreate(BaseModel):
    """Schema for adding a part to a build."""

    part_id: UUID = Field(..., description="Part UUID")
    quantity: int = Field(..., ge=1, description="Quantity of this part required")


class BuildPartResponse(BaseModel):
    """Schema for build part response."""

    part_id: UUID
    quantity: int
    part_name: Optional[str] = None
    part_sku: Optional[str] = None


class BuildBase(BaseModel):
    """Base build schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Build name")
    model_number: Optional[str] = Field(None, max_length=100, description="Model number")
    description: Optional[str] = Field(None, description="Build description")
    base_price: Optional[Decimal] = Field(None, ge=0, description="Base price in EUR")
    status: str = Field(
        default='draft',
        max_length=50,
        description="Build status (draft, ready_for_production, in_production, discontinued)"
    )
    build_time_hours: Optional[Decimal] = Field(None, ge=0, description="Estimated build time in hours")
    notes: Optional[str] = Field(None, description="Additional notes")
    is_active: bool = Field(default=True, description="Whether build is active")


class BuildCreate(BuildBase):
    """Schema for creating a new build."""

    parts: list[BuildPartCreate] = Field(default_factory=list, description="List of parts required for this build")


class BuildUpdate(BaseModel):
    """Schema for updating an existing build."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    model_number: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    base_price: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = Field(None, max_length=50)
    build_time_hours: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    parts: Optional[list[BuildPartCreate]] = Field(None, description="Update parts list (replaces existing)")


class Build(BuildBase):
    """Schema for build response."""

    id: UUID
    parts: list[BuildPartResponse] = []
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BuildList(BaseModel):
    """Schema for paginated build list response."""

    items: list[Build]
    total: int
    page: int
    per_page: int
    total_pages: int
