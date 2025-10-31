"""Delivery schemas for request/response validation."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class DeliveryBase(BaseModel):
    """Base delivery schema with common fields."""

    customer_id: UUID = Field(..., description="Customer UUID")
    build_id: Optional[UUID] = Field(None, description="Build UUID")
    expected_delivery_date: Optional[datetime] = Field(None, description="Expected delivery date")
    shipping_address_line1: Optional[str] = Field(None, max_length=255)
    shipping_address_line2: Optional[str] = Field(None, max_length=255)
    shipping_city: Optional[str] = Field(None, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=100)
    shipping_postal_code: Optional[str] = Field(None, max_length=20)
    shipping_country: Optional[str] = Field(None, max_length=100)
    tracking_number: Optional[str] = Field(None, max_length=255)
    carrier: Optional[str] = Field(None, max_length=100)
    status: str = Field(default='pending', max_length=50)
    shipping_cost: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    requires_signature: bool = Field(default=False)


class DeliveryCreate(DeliveryBase):
    """Schema for creating a new delivery."""
    pass


class DeliveryUpdate(BaseModel):
    """Schema for updating an existing delivery."""

    customer_id: Optional[UUID] = None
    build_id: Optional[UUID] = None
    delivery_date: Optional[datetime] = None
    expected_delivery_date: Optional[datetime] = None
    shipping_address_line1: Optional[str] = Field(None, max_length=255)
    shipping_address_line2: Optional[str] = Field(None, max_length=255)
    shipping_city: Optional[str] = Field(None, max_length=100)
    shipping_state: Optional[str] = Field(None, max_length=100)
    shipping_postal_code: Optional[str] = Field(None, max_length=20)
    shipping_country: Optional[str] = Field(None, max_length=100)
    tracking_number: Optional[str] = Field(None, max_length=255)
    carrier: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=50)
    shipping_cost: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    requires_signature: Optional[bool] = None
    signed_by: Optional[str] = Field(None, max_length=255)
    signature_date: Optional[datetime] = None


class Delivery(DeliveryBase):
    """Schema for delivery response."""

    id: UUID
    delivery_number: str
    delivery_date: Optional[datetime] = None
    signed_by: Optional[str] = None
    signature_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeliveryList(BaseModel):
    """Schema for paginated delivery list response."""

    items: list[Delivery]
    total: int
    page: int
    per_page: int
    total_pages: int
