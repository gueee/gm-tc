"""Delivery model for tracking shipments."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base


class Delivery(Base):
    """Delivery model for managing shipments and delivery notes."""

    __tablename__ = "deliveries"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Delivery number (auto-generated unique identifier)
    delivery_number = Column(String(50), nullable=False, unique=True, index=True)

    # Foreign keys
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'), nullable=False, index=True)
    build_id = Column(UUID(as_uuid=True), ForeignKey('builds.id'), nullable=True, index=True)

    # Delivery information
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    expected_delivery_date = Column(DateTime(timezone=True), nullable=True)

    # Shipping information
    shipping_address_line1 = Column(String(255), nullable=True)
    shipping_address_line2 = Column(String(255), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(100), nullable=True)
    shipping_postal_code = Column(String(20), nullable=True)
    shipping_country = Column(String(100), nullable=True)

    # Tracking
    tracking_number = Column(String(255), nullable=True)
    carrier = Column(String(100), nullable=True)

    # Delivery status
    # Possible values: pending, in_transit, delivered, cancelled, returned
    status = Column(String(50), nullable=False, default='pending', index=True)

    # Pricing
    shipping_cost = Column(Numeric(10, 2), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Signature confirmation
    requires_signature = Column(Boolean, default=False)
    signed_by = Column(String(255), nullable=True)
    signature_date = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("Customer", backref="deliveries", lazy='selectin')
    build = relationship("Build", backref="deliveries", lazy='selectin')

    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Delivery {self.delivery_number}>"
