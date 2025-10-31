"""Supplier management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from typing import Optional
from datetime import datetime
from math import ceil

from app.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.schemas.supplier import (
    Supplier as SupplierSchema,
    SupplierCreate,
    SupplierUpdate,
    SupplierList,
)

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("/", response_model=SupplierList)
def list_suppliers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or contact person"),
    active_only: bool = Query(False, description="Filter for active suppliers only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all suppliers with pagination and filtering.

    Args:
        page: Page number (starts at 1)
        per_page: Number of items per page
        search: Optional search term for name, email, or contact person
        active_only: If True, only return active suppliers
        db: Database session
        current_user: Current authenticated user

    Returns:
        Paginated list of suppliers
    """
    # Build query
    query = db.query(Supplier).filter(Supplier.deleted_at.is_(None))

    # Apply filters
    if active_only:
        query = query.filter(Supplier.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Supplier.name.ilike(search_term),
                Supplier.email.ilike(search_term),
                Supplier.contact_person.ilike(search_term),
            )
        )

    # Count total
    total = query.count()
    total_pages = ceil(total / per_page)

    # Apply pagination
    offset = (page - 1) * per_page
    suppliers = query.order_by(Supplier.name).offset(offset).limit(per_page).all()

    return SupplierList(
        items=suppliers,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("/", response_model=SupplierSchema, status_code=status.HTTP_201_CREATED)
def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new supplier.

    Args:
        supplier_data: Supplier creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created supplier
    """
    # Check for duplicate name
    existing = db.query(Supplier).filter(
        Supplier.name == supplier_data.name,
        Supplier.deleted_at.is_(None),
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Supplier with name '{supplier_data.name}' already exists",
        )

    # Create supplier
    supplier = Supplier(**supplier_data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@router.get("/{supplier_id}", response_model=SupplierSchema)
def get_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get supplier by ID.

    Args:
        supplier_id: Supplier UUID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Supplier details

    Raises:
        HTTPException: If supplier not found
    """
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.deleted_at.is_(None),
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    return supplier


@router.patch("/{supplier_id}", response_model=SupplierSchema)
def update_supplier(
    supplier_id: UUID,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update supplier details.

    Args:
        supplier_id: Supplier UUID
        supplier_data: Supplier update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated supplier

    Raises:
        HTTPException: If supplier not found
    """
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.deleted_at.is_(None),
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    # Update fields
    update_data = supplier_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete a supplier.

    Args:
        supplier_id: Supplier UUID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If supplier not found
    """
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.deleted_at.is_(None),
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    # Soft delete
    supplier.deleted_at = datetime.utcnow()
    db.commit()
