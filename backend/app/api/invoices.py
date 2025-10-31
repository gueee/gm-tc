"""Invoice management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from typing import Optional
from datetime import datetime
from math import ceil
from decimal import Decimal

from app.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from app.models.customer import Customer
from app.models.delivery import Delivery
from app.schemas.invoice import (
    Invoice as InvoiceSchema,
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceList,
)

router = APIRouter(prefix="/invoices", tags=["invoices"])


def generate_invoice_number(db: Session) -> str:
    """Generate unique invoice number."""
    last_invoice = db.query(Invoice).order_by(Invoice.created_at.desc()).first()
    if last_invoice and last_invoice.invoice_number:
        try:
            last_num = int(last_invoice.invoice_number.split('-')[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1
    else:
        new_num = 1
    
    return f"INV-{new_num:06d}"


@router.get("/", response_model=InvoiceList)
def list_invoices(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by invoice number"),
    status: Optional[str] = Query(None, description="Filter by status"),
    customer_id: Optional[UUID] = Query(None, description="Filter by customer"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all invoices with pagination and filtering."""
    query = db.query(Invoice).filter(Invoice.deleted_at.is_(None))

    if status:
        query = query.filter(Invoice.status == status)

    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(Invoice.invoice_number.ilike(search_term))

    total = query.count()
    total_pages = ceil(total / per_page)

    offset = (page - 1) * per_page
    invoices = query.order_by(Invoice.created_at.desc()).offset(offset).limit(per_page).all()

    return InvoiceList(
        items=invoices,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("/", response_model=InvoiceSchema, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new invoice."""
    # Validate customer exists
    customer = db.query(Customer).filter(
        Customer.id == invoice_data.customer_id,
        Customer.deleted_at.is_(None)
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Validate delivery if provided
    if invoice_data.delivery_id:
        delivery = db.query(Delivery).filter(
            Delivery.id == invoice_data.delivery_id,
            Delivery.deleted_at.is_(None)
        ).first()
        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery not found"
            )

    # Generate invoice number
    invoice_number = generate_invoice_number(db)

    # Calculate tax and total
    tax_amount = invoice_data.subtotal * (invoice_data.tax_rate / Decimal('100'))
    total_amount = invoice_data.subtotal + tax_amount - invoice_data.discount_amount

    invoice_dict = invoice_data.model_dump()
    invoice = Invoice(
        **invoice_dict,
        invoice_number=invoice_number,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status='draft'
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice


@router.get("/{invoice_id}", response_model=InvoiceSchema)
def get_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get invoice by ID."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.deleted_at.is_(None),
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    return invoice


@router.patch("/{invoice_id}", response_model=InvoiceSchema)
def update_invoice(
    invoice_id: UUID,
    invoice_data: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update invoice details."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.deleted_at.is_(None),
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    update_data = invoice_data.model_dump(exclude_unset=True)
    
    # Recalculate if amounts change
    if 'subtotal' in update_data or 'tax_rate' in update_data or 'discount_amount' in update_data:
        subtotal = update_data.get('subtotal', invoice.subtotal)
        tax_rate = update_data.get('tax_rate', invoice.tax_rate)
        discount = update_data.get('discount_amount', invoice.discount_amount)
        
        tax_amount = subtotal * (tax_rate / Decimal('100'))
        total_amount = subtotal + tax_amount - discount
        
        update_data['tax_amount'] = tax_amount
        update_data['total_amount'] = total_amount

    for field, value in update_data.items():
        setattr(invoice, field, value)

    db.commit()
    db.refresh(invoice)

    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete an invoice."""
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.deleted_at.is_(None),
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found",
        )

    invoice.deleted_at = datetime.utcnow()
    db.commit()
