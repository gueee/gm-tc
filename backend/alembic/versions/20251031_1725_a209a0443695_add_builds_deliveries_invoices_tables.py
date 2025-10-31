"""Add builds deliveries invoices tables

Revision ID: a209a0443695
Revises: 2f18c6342d14
Create Date: 2025-10-31 17:25:00.000000+00:00

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid

# revision identifiers, used by Alembic.
revision = "a209a0443695"
down_revision = "2f18c6342d14"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create builds table
    op.create_table(
        "builds",
        sa.Column("id", sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
        sa.Column("name", sa.String(255), nullable=False, index=True),
        sa.Column("model_number", sa.String(100), nullable=True, index=True, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("base_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, default="draft", index=True),
        sa.Column("build_time_hours", sa.Numeric(10, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create build_parts junction table
    op.create_table(
        "build_parts",
        sa.Column("id", sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
        sa.Column("build_id", sa.String(36), sa.ForeignKey("builds.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("part_id", sa.String(36), sa.ForeignKey("parts.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("quantity", sa.Integer(), nullable=False, default=1),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Create deliveries table
    op.create_table(
        "deliveries",
        sa.Column("id", sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
        sa.Column("delivery_number", sa.String(50), nullable=False, unique=True, index=True),
        sa.Column("customer_id", sa.String(36), sa.ForeignKey("customers.id"), nullable=False, index=True),
        sa.Column("build_id", sa.String(36), sa.ForeignKey("builds.id"), nullable=True, index=True),
        sa.Column("delivery_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expected_delivery_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("shipping_address_line1", sa.String(255), nullable=True),
        sa.Column("shipping_address_line2", sa.String(255), nullable=True),
        sa.Column("shipping_city", sa.String(100), nullable=True),
        sa.Column("shipping_state", sa.String(100), nullable=True),
        sa.Column("shipping_postal_code", sa.String(20), nullable=True),
        sa.Column("shipping_country", sa.String(100), nullable=True),
        sa.Column("tracking_number", sa.String(255), nullable=True),
        sa.Column("carrier", sa.String(100), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, default="pending", index=True),
        sa.Column("shipping_cost", sa.Numeric(10, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("requires_signature", sa.Boolean(), default=False),
        sa.Column("signed_by", sa.String(255), nullable=True),
        sa.Column("signature_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create invoices table
    op.create_table(
        "invoices",
        sa.Column("id", sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
        sa.Column("invoice_number", sa.String(50), nullable=False, unique=True, index=True),
        sa.Column("customer_id", sa.String(36), sa.ForeignKey("customers.id"), nullable=False, index=True),
        sa.Column("delivery_id", sa.String(36), sa.ForeignKey("deliveries.id"), nullable=True, index=True),
        sa.Column("invoice_date", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("paid_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("tax_rate", sa.Numeric(5, 2), nullable=False, default=19.0),
        sa.Column("tax_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(10, 2), nullable=True, default=0.0),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, default="draft", index=True),
        sa.Column("payment_method", sa.String(100), nullable=True),
        sa.Column("payment_reference", sa.String(255), nullable=True),
        sa.Column("billing_address_line1", sa.String(255), nullable=True),
        sa.Column("billing_address_line2", sa.String(255), nullable=True),
        sa.Column("billing_city", sa.String(100), nullable=True),
        sa.Column("billing_state", sa.String(100), nullable=True),
        sa.Column("billing_postal_code", sa.String(20), nullable=True),
        sa.Column("billing_country", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("terms_and_conditions", sa.Text(), nullable=True),
        sa.Column("reminder_sent", sa.Boolean(), default=False),
        sa.Column("reminder_count", sa.Numeric(10, 0), default=0),
        sa.Column("last_reminder_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("invoices")
    op.drop_table("deliveries")
    op.drop_table("build_parts")
    op.drop_table("builds")
