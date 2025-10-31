"""Supplier schemas for request/response validation."""

from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class SupplierBase(BaseModel):
    """Base supplier schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Supplier name")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person name")
    email: Optional[EmailStr] = Field(None, description="Supplier email")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    address_line1: Optional[str] = Field(None, max_length=255, description="Address line 1")
    address_line2: Optional[str] = Field(None, max_length=255, description="Address line 2")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State/Province")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    website: Optional[str] = Field(None, max_length=255, description="Website URL")
    notes: Optional[str] = Field(None, description="Additional notes")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Supplier rating (1-5)")
    is_active: bool = Field(default=True, description="Whether supplier is active")


class SupplierCreate(SupplierBase):
    """Schema for creating a new supplier."""
    pass


class SupplierUpdate(BaseModel):
    """Schema for updating an existing supplier."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class Supplier(SupplierBase):
    """Schema for supplier response."""

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierList(BaseModel):
    """Schema for paginated supplier list response."""

    items: list[Supplier]
    total: int
    page: int
    per_page: int
    total_pages: int
