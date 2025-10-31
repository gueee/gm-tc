"""Build model for printer configurations."""

import uuid
from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, Numeric, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base


# Junction table for many-to-many relationship between builds and parts
build_parts = Table(
    'build_parts',
    Base.metadata,
    Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column('build_id', UUID(as_uuid=True), ForeignKey('builds.id', ondelete='CASCADE'), nullable=False, index=True),
    Column('part_id', UUID(as_uuid=True), ForeignKey('parts.id', ondelete='CASCADE'), nullable=False, index=True),
    Column('quantity', Integer, nullable=False, default=1),
    Column('created_at', DateTime(timezone=True), server_default=func.now(), nullable=False),
)


class Build(Base):
    """Build model for managing printer configurations and recipes."""

    __tablename__ = "builds"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Basic information
    name = Column(String(255), nullable=False, index=True)
    model_number = Column(String(100), nullable=True, index=True, unique=True)
    description = Column(Text, nullable=True)

    # Pricing
    base_price = Column(Numeric(10, 2), nullable=True)

    # Build status
    # Possible values: draft, ready_for_production, in_production, discontinued
    status = Column(String(50), nullable=False, default='draft', index=True)

    # Build specifications
    build_time_hours = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)

    # Active status
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    parts = relationship(
        'Part',
        secondary=build_parts,
        backref='builds',
        lazy='selectin'
    )

    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Build {self.name} ({self.model_number})>"
