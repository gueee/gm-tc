"""Customer management endpoints."""

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
from app.models.customer import Customer
from app.schemas.customer import (
    Customer as CustomerSchema,
    CustomerCreate,
    CustomerUpdate,
    CustomerList,
)

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=CustomerList)
def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, company, or contact person"),
    customer_type: Optional[str] = Query(None, description="Filter by customer type"),
    active_only: bool = Query(False, description="Filter for active customers only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all customers with pagination and filtering.

    Args:
        page: Page number (starts at 1)
        per_page: Number of items per page
        search: Optional search term for name, email, company, or contact person
        customer_type: Filter by customer type
        active_only: If True, only return active customers
        db: Database session
        current_user: Current authenticated user

    Returns:
        Paginated list of customers
    """
    # Build query
    query = db.query(Customer).filter(Customer.deleted_at.is_(None))

    # Apply filters
    if active_only:
        query = query.filter(Customer.is_active == True)

    if customer_type:
        query = query.filter(Customer.customer_type == customer_type)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(search_term),
                Customer.email.ilike(search_term),
                Customer.company_name.ilike(search_term),
                Customer.contact_person.ilike(search_term),
            )
        )

    # Count total
    total = query.count()
    total_pages = ceil(total / per_page)

    # Apply pagination
    offset = (page - 1) * per_page
    customers = query.order_by(Customer.name).offset(offset).limit(per_page).all()

    return CustomerList(
        items=customers,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("/", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new customer.

    Args:
        customer_data: Customer creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created customer
    """
    # Check for duplicate email if provided
    if customer_data.email:
        existing = db.query(Customer).filter(
            Customer.email == customer_data.email,
            Customer.deleted_at.is_(None),
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer_data.email}' already exists",
            )

    # Create customer
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.get("/{customer_id}", response_model=CustomerSchema)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get customer by ID.

    Args:
        customer_id: Customer UUID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Customer details

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.deleted_at.is_(None),
    ).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.patch("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update customer details.

    Args:
        customer_id: Customer UUID
        customer_data: Customer update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated customer

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.deleted_at.is_(None),
    ).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    # Update fields
    update_data = customer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete a customer.

    Args:
        customer_id: Customer UUID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If customer not found
    """
    customer = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.deleted_at.is_(None),
    ).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    # Soft delete
    customer.deleted_at = datetime.utcnow()
    db.commit()
