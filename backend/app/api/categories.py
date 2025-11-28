"""Category API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from slugify import slugify
from typing import List
from app.db import get_db
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryReorder,
)
from app.api.deps import require_admin

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """List all categories (public endpoint for navigation)."""
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    categories = query.order_by(Category.sort_order).all()
    return categories


@router.get("/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Session = Depends(get_db)):
    """Get category by slug."""
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category


@router.post("", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """Create new category (admin only)."""
    # Generate slug if not provided
    slug = data.slug or slugify(data.name)

    # Check uniqueness
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )

    # Get max sort_order
    max_order = db.query(Category).count()

    category = Category(
        name=data.name,
        slug=slug,
        description=data.description,
        icon=data.icon,
        color=data.color,
        is_active=data.is_active,
        sort_order=max_order,
        meta_title=data.meta_title,
        meta_description=data.meta_description,
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.put("/{id}", response_model=CategoryResponse)
def update_category(
    id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """Update category (admin only)."""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Check slug uniqueness if changed
    if data.slug and data.slug != category.slug:
        if db.query(Category).filter(Category.slug == data.slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """Delete category (admin only)."""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    db.delete(category)
    db.commit()


@router.patch("/reorder", response_model=List[CategoryResponse])
def reorder_categories(
    data: CategoryReorder,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin)
):
    """Reorder categories (admin only)."""
    for index, category_id in enumerate(data.category_ids):
        category = db.query(Category).filter(Category.id == category_id).first()
        if category:
            category.sort_order = index

    db.commit()

    return db.query(Category).order_by(Category.sort_order).all()
