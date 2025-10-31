"""Delivery management endpoints."""

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
from app.models.delivery import Delivery
from app.models.customer import Customer
from app.models.build import Build
from app.schemas.delivery import (
    Delivery as DeliverySchema,
    DeliveryCreate,
    DeliveryUpdate,
    DeliveryList,
)

router = APIRouter(prefix="/deliveries", tags=["deliveries"])


def generate_delivery_number(db: Session) -> str:
    """Generate unique delivery number."""
    # Get last delivery number
    last_delivery = db.query(Delivery).order_by(Delivery.created_at.desc()).first()
    if last_delivery and last_delivery.delivery_number:
        try:
            last_num = int(last_delivery.delivery_number.split('-')[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1
    else:
        new_num = 1
    
    return f"DEL-{new_num:06d}"


@router.get("/", response_model=DeliveryList)
def list_deliveries(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by delivery number or tracking number"),
    status: Optional[str] = Query(None, description="Filter by status"),
    customer_id: Optional[UUID] = Query(None, description="Filter by customer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all deliveries with pagination and filtering."""
    query = db.query(Delivery).filter(Delivery.deleted_at.is_(None))

    if status:
        query = query.filter(Delivery.status == status)

    if customer_id:
        query = query.filter(Delivery.customer_id == customer_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Delivery.delivery_number.ilike(search_term),
                Delivery.tracking_number.ilike(search_term),
            )
        )

    total = query.count()
    total_pages = ceil(total / per_page)

    offset = (page - 1) * per_page
    deliveries = query.order_by(Delivery.created_at.desc()).offset(offset).limit(per_page).all()

    return DeliveryList(
        items=deliveries,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("/", response_model=DeliverySchema, status_code=status.HTTP_201_CREATED)
def create_delivery(
    delivery_data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new delivery."""
    # Validate customer exists
    customer = db.query(Customer).filter(
        Customer.id == delivery_data.customer_id,
        Customer.deleted_at.is_(None)
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Validate build if provided
    if delivery_data.build_id:
        build = db.query(Build).filter(
            Build.id == delivery_data.build_id,
            Build.deleted_at.is_(None)
        ).first()
        if not build:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Build not found"
            )

    # Generate delivery number
    delivery_number = generate_delivery_number(db)

    delivery_dict = delivery_data.model_dump()
    delivery = Delivery(**delivery_dict, delivery_number=delivery_number)
    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return delivery


@router.get("/{delivery_id}", response_model=DeliverySchema)
def get_delivery(
    delivery_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get delivery by ID."""
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.deleted_at.is_(None),
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    return delivery


@router.patch("/{delivery_id}", response_model=DeliverySchema)
def update_delivery(
    delivery_id: UUID,
    delivery_data: DeliveryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update delivery details."""
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.deleted_at.is_(None),
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    update_data = delivery_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(delivery, field, value)

    db.commit()
    db.refresh(delivery)

    return delivery


@router.delete("/{delivery_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_delivery(
    delivery_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete a delivery."""
    delivery = db.query(Delivery).filter(
        Delivery.id == delivery_id,
        Delivery.deleted_at.is_(None),
    ).first()

    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found",
        )

    delivery.deleted_at = datetime.utcnow()
    db.commit()
