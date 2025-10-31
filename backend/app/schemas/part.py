"""Part schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class PartBase(BaseModel):
    """Base part schema with common attributes."""

    sku: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    specifications: Optional[Dict[str, Any]] = Field(default_factory=dict)
    current_stock: int = Field(default=0, ge=0)
    minimum_stock: int = Field(default=0, ge=0)
    unit_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)


class PartCreate(PartBase):
    """Schema for creating a new part."""

    pass


class PartUpdate(BaseModel):
    """Schema for updating a part."""

    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    specifications: Optional[Dict[str, Any]] = None
    current_stock: Optional[int] = Field(None, ge=0)
    minimum_stock: Optional[int] = Field(None, ge=0)
    unit_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)


class PartInDB(PartBase):
    """Schema for part in database."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class Part(PartInDB):
    """Schema for part response with computed fields."""

    is_low_stock: bool
    stock_status: str


class PartList(BaseModel):
    """Schema for paginated part list response."""

    items: list[Part]
    total: int
    page: int
    per_page: int
    total_pages: int


class StockAdjustment(BaseModel):
    """Schema for adjusting stock levels."""

    quantity: int = Field(..., description="Positive to add, negative to remove")
    reason: Optional[str] = Field(None, max_length=500)
