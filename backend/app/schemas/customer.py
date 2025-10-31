"""Customer schemas for request/response validation."""

from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class CustomerBase(BaseModel):
    """Base customer schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Customer name")
    contact_person: Optional[str] = Field(None, max_length=255, description="Contact person name")
    email: Optional[EmailStr] = Field(None, description="Customer email")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    company_name: Optional[str] = Field(None, max_length=255, description="Company name")
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID / VAT number")
    address_line1: Optional[str] = Field(None, max_length=255, description="Address line 1")
    address_line2: Optional[str] = Field(None, max_length=255, description="Address line 2")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State/Province")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal code")
    country: Optional[str] = Field(None, max_length=100, description="Country")
    website: Optional[str] = Field(None, max_length=255, description="Website URL")
    notes: Optional[str] = Field(None, description="Additional notes")
    customer_type: Optional[str] = Field(None, max_length=50, description="Customer type (individual, business, etc.)")
    is_active: bool = Field(default=True, description="Whether customer is active")


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating an existing customer."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_person: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    company_name: Optional[str] = Field(None, max_length=255)
    tax_id: Optional[str] = Field(None, max_length=50)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    customer_type: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class Customer(CustomerBase):
    """Schema for customer response."""

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CustomerList(BaseModel):
    """Schema for paginated customer list response."""

    items: list[Customer]
    total: int
    page: int
    per_page: int
    total_pages: int
