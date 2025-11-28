"""Content API routes."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from slugify import slugify
from typing import Optional, List
from datetime import datetime
from app.db import get_db
from app.models.content import Content, ContentType, ContentStatus
from app.models.category import Category
from app.models.tag import Tag
from app.schemas.content import (
    ContentCreate,
    ContentUpdate,
    ContentResponse,
    ContentListItem,
    ContentListResponse,
)
from app.api.deps import require_admin, get_current_user_optional

router = APIRouter(prefix="/content", tags=["content"])


@router.get("", response_model=ContentListResponse)
def list_content(
    category: Optional[str] = None,
    content_type: Optional[ContentType] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[ContentStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """List published content with filtering and pagination."""
    query = db.query(Content).options(joinedload(Content.category))

    # Default to published for public
    if status is None:
        query = query.filter(Content.status == ContentStatus.PUBLISHED)
    else:
        query = query.filter(Content.status == status)

    if category:
        query = query.join(Content.category).filter(Category.slug == category)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if tag:
        query = query.join(Content.tags).filter(Tag.slug == tag)
    if search:
        query = query.filter(
            Content.title.ilike(f"%{search}%") |
            Content.excerpt.ilike(f"%{search}%")
        )

    total = query.count()
    items = query.order_by(Content.published_at.desc().nullslast(), Content.created_at.desc())\
        .offset((page - 1) * limit)\
        .limit(limit)\
        .all()

    return ContentListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit if total > 0 else 0,
    )


@router.get("/{slug}", response_model=ContentResponse)
def get_content(slug: str, db: Session = Depends(get_db)):
    """Get single published content by slug."""
    content = db.query(Content).options(
        joinedload(Content.category),
        joinedload(Content.tags)
    ).filter(
        Content.slug == slug,
        Content.status == ContentStatus.PUBLISHED
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Increment view count
    content.view_count += 1
    db.commit()

    return content


# Admin endpoints

@router.get("/admin/all", response_model=ContentListResponse)
def list_all_content(
    category: Optional[str] = None,
    content_type: Optional[ContentType] = None,
    status: Optional[ContentStatus] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """List all content including drafts (admin only)."""
    query = db.query(Content).options(joinedload(Content.category))

    if category:
        query = query.join(Content.category).filter(Category.slug == category)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if status:
        query = query.filter(Content.status == status)
    if search:
        query = query.filter(
            Content.title.ilike(f"%{search}%") |
            Content.excerpt.ilike(f"%{search}%")
        )

    total = query.count()
    items = query.order_by(Content.updated_at.desc())\
        .offset((page - 1) * limit)\
        .limit(limit)\
        .all()

    return ContentListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit if total > 0 else 0,
    )


@router.get("/admin/{id}", response_model=ContentResponse)
def get_content_by_id(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Get content by ID for editing (admin only)."""
    content = db.query(Content).options(
        joinedload(Content.category),
        joinedload(Content.tags)
    ).filter(Content.id == id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    return content


@router.post("", response_model=ContentResponse)
def create_content(
    data: ContentCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Create new content (admin only)."""
    # Generate slug if not provided
    slug = data.slug or slugify(data.title)

    # Ensure unique slug
    base_slug = slug
    counter = 1
    while db.query(Content).filter(Content.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    content = Content(
        title=data.title,
        slug=slug,
        excerpt=data.excerpt,
        content_type=data.content_type,
        blocks=data.blocks,
        extra_data=data.extra_data,
        category_id=data.category_id,
        featured_image_id=data.featured_image_id,
        is_featured=data.is_featured,
        meta_title=data.meta_title,
        meta_description=data.meta_description,
    )

    db.add(content)
    db.commit()
    db.refresh(content)

    return content


@router.put("/{id}", response_model=ContentResponse)
def update_content(
    id: int,
    data: ContentUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Update content (admin only)."""
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Check slug uniqueness if changed
    if data.slug and data.slug != content.slug:
        if db.query(Content).filter(Content.slug == data.slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content with this slug already exists"
            )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Delete content (admin only)."""
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()


@router.post("/{id}/publish", response_model=ContentResponse)
def publish_content(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Publish content (admin only)."""
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    content.status = ContentStatus.PUBLISHED
    if not content.published_at:
        content.published_at = datetime.utcnow()

    db.commit()
    db.refresh(content)

    return content


@router.post("/{id}/unpublish", response_model=ContentResponse)
def unpublish_content(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Unpublish content (admin only)."""
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    content.status = ContentStatus.DRAFT
    db.commit()
    db.refresh(content)

    return content
