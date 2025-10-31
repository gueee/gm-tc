"""Part model for inventory management."""

from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from app.db.base import Base


class Part(Base):
    """Part model for 3D printer components inventory."""

    __tablename__ = "parts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)

    # Specifications stored as JSON for flexibility
    specifications = Column(JSONB, nullable=True, default=dict)

    # Inventory tracking
    current_stock = Column(Integer, default=0, nullable=False)
    minimum_stock = Column(Integer, default=0, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=True)

    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Part {self.sku}: {self.name}>"

    @property
    def is_low_stock(self) -> bool:
        """Check if part is below minimum stock level."""
        return self.current_stock < self.minimum_stock

    @property
    def stock_status(self) -> str:
        """Get stock status string."""
        if self.current_stock == 0:
            return "out_of_stock"
        elif self.is_low_stock:
            return "low_stock"
        else:
            return "in_stock"
