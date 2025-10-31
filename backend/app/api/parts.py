"""Parts management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.db import get_db
from app.models.part import Part as PartModel
from app.schemas.part import (
    Part,
    PartCreate,
    PartUpdate,
    PartList,
    StockAdjustment
)
from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/parts", tags=["parts"])


@router.get("/", response_model=PartList)
def list_parts(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all parts with pagination and filtering.

    Args:
        page: Page number (starts at 1)
        per_page: Items per page
        search: Search in SKU, name, or description
        category: Filter by category
        low_stock_only: Show only parts below minimum stock
        db: Database session
        current_user: Current authenticated user

    Returns:
        Paginated list of parts
    """
    query = db.query(PartModel).filter(PartModel.deleted_at.is_(None))

    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                PartModel.sku.ilike(search_term),
                PartModel.name.ilike(search_term),
                PartModel.description.ilike(search_term)
            )
        )

    if category:
        query = query.filter(PartModel.category == category)

    if low_stock_only:
        query = query.filter(PartModel.current_stock < PartModel.minimum_stock)

    # Get total count
    total = query.count()

    # Calculate pagination
    total_pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page

    # Get paginated results
    parts = query.order_by(PartModel.name).offset(offset).limit(per_page).all()

    return {
        "items": parts,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/{part_id}", response_model=Part)
def get_part(
    part_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific part by ID.

    Args:
        part_id: Part UUID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Part details

    Raises:
        HTTPException: If part not found
    """
    part = db.query(PartModel).filter(
        PartModel.id == part_id,
        PartModel.deleted_at.is_(None)
    ).first()

    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )

    return part


@router.post("/", response_model=Part, status_code=status.HTTP_201_CREATED)
def create_part(
    part_data: PartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new part.

    Args:
        part_data: Part creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created part

    Raises:
        HTTPException: If SKU already exists
    """
    # Check if SKU already exists
    existing_part = db.query(PartModel).filter(
        PartModel.sku == part_data.sku,
        PartModel.deleted_at.is_(None)
    ).first()

    if existing_part:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Part with SKU '{part_data.sku}' already exists"
        )

    # Create new part
    new_part = PartModel(**part_data.model_dump())
    db.add(new_part)
    db.commit()
    db.refresh(new_part)

    return new_part


@router.put("/{part_id}", response_model=Part)
def update_part(
    part_id: UUID,
    part_data: PartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a part.

    Args:
        part_id: Part UUID
        part_data: Part update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated part

    Raises:
        HTTPException: If part not found or SKU conflict
    """
    part = db.query(PartModel).filter(
        PartModel.id == part_id,
        PartModel.deleted_at.is_(None)
    ).first()

    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )

    # Check SKU conflict if SKU is being updated
    if part_data.sku and part_data.sku != part.sku:
        existing_part = db.query(PartModel).filter(
            PartModel.sku == part_data.sku,
            PartModel.deleted_at.is_(None),
            PartModel.id != part_id
        ).first()

        if existing_part:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Part with SKU '{part_data.sku}' already exists"
            )

    # Update part fields
    update_data = part_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(part, field, value)

    db.commit()
    db.refresh(part)

    return part


@router.delete("/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_part(
    part_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a part (soft delete).

    Args:
        part_id: Part UUID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If part not found
    """
    part = db.query(PartModel).filter(
        PartModel.id == part_id,
        PartModel.deleted_at.is_(None)
    ).first()

    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )

    # Soft delete
    part.deleted_at = datetime.utcnow()
    db.commit()


@router.patch("/{part_id}/stock", response_model=Part)
def adjust_stock(
    part_id: UUID,
    adjustment: StockAdjustment,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adjust stock level for a part.

    Args:
        part_id: Part UUID
        adjustment: Stock adjustment data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated part

    Raises:
        HTTPException: If part not found or invalid stock level
    """
    part = db.query(PartModel).filter(
        PartModel.id == part_id,
        PartModel.deleted_at.is_(None)
    ).first()

    if not part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Part not found"
        )

    # Calculate new stock level
    new_stock = part.current_stock + adjustment.quantity

    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reduce stock below 0. Current: {part.current_stock}, Adjustment: {adjustment.quantity}"
        )

    # Update stock
    part.current_stock = new_stock
    db.commit()
    db.refresh(part)

    return part


@router.get("/categories/list", response_model=list[str])
def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get list of all part categories.

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of unique categories
    """
    categories = db.query(PartModel.category).filter(
        PartModel.deleted_at.is_(None),
        PartModel.category.isnot(None)
    ).distinct().all()

    return [cat[0] for cat in categories if cat[0]]
