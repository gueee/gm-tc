"""Invoice model for billing management."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base


class Invoice(Base):
    """Invoice model for managing billing and payments."""

    __tablename__ = "invoices"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Invoice number (auto-generated unique identifier)
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)

    # Foreign keys
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'), nullable=False, index=True)
    delivery_id = Column(UUID(as_uuid=True), ForeignKey('deliveries.id'), nullable=True, index=True)

    # Invoice dates
    invoice_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid_date = Column(DateTime(timezone=True), nullable=True)

    # Amounts (in EUR)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax_rate = Column(Numeric(5, 2), nullable=False, default=19.0)  # Default 19% VAT for Germany
    tax_amount = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), nullable=True, default=0.0)
    total_amount = Column(Numeric(10, 2), nullable=False)

    # Payment information
    # Possible values: draft, sent, paid, overdue, cancelled, refunded
    status = Column(String(50), nullable=False, default='draft', index=True)
    payment_method = Column(String(100), nullable=True)
    payment_reference = Column(String(255), nullable=True)

    # Billing address (can differ from customer default)
    billing_address_line1 = Column(String(255), nullable=True)
    billing_address_line2 = Column(String(255), nullable=True)
    billing_city = Column(String(100), nullable=True)
    billing_state = Column(String(100), nullable=True)
    billing_postal_code = Column(String(20), nullable=True)
    billing_country = Column(String(100), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)

    # Reminder tracking
    reminder_sent = Column(Boolean, default=False)
    reminder_count = Column(Numeric(10, 0), default=0)
    last_reminder_date = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    customer = relationship("Customer", backref="invoices", lazy='selectin')
    delivery = relationship("Delivery", backref="invoices", lazy='selectin')

    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Invoice {self.invoice_number}>"
