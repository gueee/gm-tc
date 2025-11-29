"""
Content API endpoints (articles, categories).
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user, get_optional_user
from app.models.content import Content, Category
from app.models.user import User
from app.schemas.content import (
    ContentResponse, ContentCreate, ContentUpdate, ContentListResponse,
    CategoryResponse, CategoryCreate, CategoryUpdate
)

router = APIRouter(tags=["Content"])


# =============================================================================
# PUBLIC CONTENT ENDPOINTS
# =============================================================================

@router.get("/content", response_model=ContentListResponse)
async def list_content(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List published content with pagination.
    """
    query = db.query(Content).filter(Content.status == "published")

    # Filter by category slug
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            query = query.filter(Content.category_id == cat.id)

    # Filter by content type
    if content_type:
        query = query.filter(Content.content_type == content_type)

    # Get total count
    total = query.count()

    # Calculate pagination
    pages = (total + limit - 1) // limit
    offset = (page - 1) * limit

    # Get items
    items = query.order_by(Content.created_at.desc()).offset(offset).limit(limit).all()

    return ContentListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )


@router.get("/content/{slug}", response_model=ContentResponse)
async def get_content_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get single content item by slug.
    Increments view count.
    """
    content = db.query(Content).filter(
        Content.slug == slug,
        Content.status == "published"
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


# =============================================================================
# PUBLIC CATEGORY ENDPOINTS
# =============================================================================

@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    List all categories.
    """
    query = db.query(Category)

    if active_only:
        query = query.filter(Category.is_active == True)

    return query.order_by(Category.sort_order).all()


@router.get("/categories/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get single category by slug.
    """
    category = db.query(Category).filter(Category.slug == slug).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return category


# =============================================================================
# ADMIN CONTENT ENDPOINTS (Require Authentication)
# =============================================================================

@router.get("/content/by-id/{content_id}", response_model=ContentResponse)
async def get_content_by_id(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Get content by ID (includes drafts).
    """
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    return content


@router.get("/content/admin/list", response_model=ContentListResponse)
async def admin_list_content(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: List all content (including drafts).
    """
    query = db.query(Content)

    if status_filter:
        query = query.filter(Content.status == status_filter)

    total = query.count()
    pages = (total + limit - 1) // limit
    offset = (page - 1) * limit

    items = query.order_by(Content.created_at.desc()).offset(offset).limit(limit).all()

    return ContentListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )


@router.post("/content/admin", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_content(
    content_data: ContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Create new content.
    """
    # Check for duplicate slug
    existing = db.query(Content).filter(Content.slug == content_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists"
        )

    # Verify category exists if provided
    if content_data.category_id:
        category = db.query(Category).filter(Category.id == content_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )

    content = Content(**content_data.model_dump())
    db.add(content)
    db.commit()
    db.refresh(content)

    return content


@router.put("/content/admin/{content_id}", response_model=ContentResponse)
async def admin_update_content(
    content_id: int,
    content_data: ContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Update existing content.
    """
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    # Check for slug conflict
    if content_data.slug and content_data.slug != content.slug:
        existing = db.query(Content).filter(Content.slug == content_data.slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug already exists"
            )

    # Update fields
    update_data = content_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/content/admin/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Delete content.
    """
    content = db.query(Content).filter(Content.id == content_id).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()


# =============================================================================
# ADMIN CATEGORY ENDPOINTS
# =============================================================================

@router.post("/categories/admin", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Create new category.
    """
    existing = db.query(Category).filter(Category.slug == category_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists"
        )

    category = Category(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.put("/categories/admin/{category_id}", response_model=CategoryResponse)
async def admin_update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Update existing category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


@router.delete("/categories/admin/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Delete category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Check for associated content
    content_count = db.query(Content).filter(Content.category_id == category_id).count()
    if content_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category with {content_count} associated content items"
        )

    db.delete(category)
    db.commit()



