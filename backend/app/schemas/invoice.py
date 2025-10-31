"""Invoice schemas for request/response validation."""

from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal


class InvoiceBase(BaseModel):
    """Base invoice schema with common fields."""

    customer_id: UUID = Field(..., description="Customer UUID")
    delivery_id: Optional[UUID] = Field(None, description="Delivery UUID")
    due_date: datetime = Field(..., description="Payment due date")
    subtotal: Decimal = Field(..., ge=0, description="Subtotal before tax")
    tax_rate: Decimal = Field(default=Decimal('19.0'), ge=0, le=100, description="Tax rate percentage")
    discount_amount: Decimal = Field(default=Decimal('0.0'), ge=0, description="Discount amount")
    payment_method: Optional[str] = Field(None, max_length=100)
    billing_address_line1: Optional[str] = Field(None, max_length=255)
    billing_address_line2: Optional[str] = Field(None, max_length=255)
    billing_city: Optional[str] = Field(None, max_length=100)
    billing_state: Optional[str] = Field(None, max_length=100)
    billing_postal_code: Optional[str] = Field(None, max_length=20)
    billing_country: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    """Schema for creating a new invoice."""
    pass


class InvoiceUpdate(BaseModel):
    """Schema for updating an existing invoice."""

    customer_id: Optional[UUID] = None
    delivery_id: Optional[UUID] = None
    invoice_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    subtotal: Optional[Decimal] = Field(None, ge=0)
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    discount_amount: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = Field(None, max_length=50)
    payment_method: Optional[str] = Field(None, max_length=100)
    payment_reference: Optional[str] = Field(None, max_length=255)
    billing_address_line1: Optional[str] = Field(None, max_length=255)
    billing_address_line2: Optional[str] = Field(None, max_length=255)
    billing_city: Optional[str] = Field(None, max_length=100)
    billing_state: Optional[str] = Field(None, max_length=100)
    billing_postal_code: Optional[str] = Field(None, max_length=20)
    billing_country: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None


class Invoice(InvoiceBase):
    """Schema for invoice response."""

    id: UUID
    invoice_number: str
    invoice_date: datetime
    paid_date: Optional[datetime] = None
    tax_amount: Decimal
    total_amount: Decimal
    status: str
    payment_reference: Optional[str] = None
    reminder_sent: bool
    reminder_count: Decimal
    last_reminder_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceList(BaseModel):
    """Schema for paginated invoice list response."""

    items: list[Invoice]
    total: int
    page: int
    per_page: int
    total_pages: int
