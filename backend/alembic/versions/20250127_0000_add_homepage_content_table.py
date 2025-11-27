"""Add homepage_content table

Revision ID: add_homepage_content
Revises: add_blog_posts
Create Date: 2025-01-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_homepage_content'
down_revision = 'add_blog_posts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'homepage_content',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_homepage_content_key'), 'homepage_content', ['key'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_homepage_content_key'), table_name='homepage_content')
    op.drop_table('homepage_content')

