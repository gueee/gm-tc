"""Build management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from uuid import UUID
from typing import Optional
from datetime import datetime
from math import ceil

from app.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.build import Build, build_parts
from app.models.part import Part
from app.schemas.build import (
    Build as BuildSchema,
    BuildCreate,
    BuildUpdate,
    BuildList,
    BuildPartResponse,
)

router = APIRouter(prefix="/builds", tags=["builds"])


@router.get("/", response_model=BuildList)
def list_builds(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or model number"),
    status: Optional[str] = Query(None, description="Filter by status"),
    active_only: bool = Query(False, description="Filter for active builds only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all builds with pagination and filtering.

    Args:
        page: Page number (starts at 1)
        per_page: Number of items per page
        search: Optional search term for name or model number
        status: Filter by build status
        active_only: If True, only return active builds
        db: Database session
        current_user: Current authenticated user

    Returns:
        Paginated list of builds
    """
    # Build query
    query = db.query(Build).filter(Build.deleted_at.is_(None))

    # Apply filters
    if active_only:
        query = query.filter(Build.is_active == True)

    if status:
        query = query.filter(Build.status == status)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Build.name.ilike(search_term),
                Build.model_number.ilike(search_term),
            )
        )

    # Count total
    total = query.count()
    total_pages = ceil(total / per_page)

    # Apply pagination
    offset = (page - 1) * per_page
    builds = query.order_by(Build.name).offset(offset).limit(per_page).all()

    # Convert builds to response format with part details
    builds_with_parts = []
    for build in builds:
        build_dict = BuildSchema.model_validate(build).model_dump()

        # Get parts with quantities from junction table
        stmt = select(build_parts.c.part_id, build_parts.c.quantity).where(build_parts.c.build_id == build.id)
        result = db.execute(stmt).all()

        part_responses = []
        for part_id, quantity in result:
            part = db.query(Part).filter(Part.id == part_id).first()
            if part:
                part_responses.append(BuildPartResponse(
                    part_id=part_id,
                    quantity=quantity,
                    part_name=part.name,
                    part_sku=part.sku
                ))

        build_dict['parts'] = part_responses
        builds_with_parts.append(build_dict)

    return BuildList(
        items=builds_with_parts,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


@router.post("/", response_model=BuildSchema, status_code=status.HTTP_201_CREATED)
def create_build(
    build_data: BuildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new build configuration.

    Args:
        build_data: Build creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created build
    """
    # Check for duplicate model number if provided
    if build_data.model_number:
        existing = db.query(Build).filter(
            Build.model_number == build_data.model_number,
            Build.deleted_at.is_(None),
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Build with model number '{build_data.model_number}' already exists",
            )

    # Validate that all parts exist
    for part_item in build_data.parts:
        part = db.query(Part).filter(Part.id == part_item.part_id, Part.deleted_at.is_(None)).first()
        if not part:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Part with ID {part_item.part_id} not found",
            )

    # Create build (exclude parts from initial creation)
    build_dict = build_data.model_dump(exclude={'parts'})
    build = Build(**build_dict)
    db.add(build)
    db.flush()  # Get the build ID before adding parts

    # Add parts to build via junction table
    for part_item in build_data.parts:
        stmt = build_parts.insert().values(
            build_id=build.id,
            part_id=part_item.part_id,
            quantity=part_item.quantity
        )
        db.execute(stmt)

    db.commit()
    db.refresh(build)

    return build


@router.get("/{build_id}", response_model=BuildSchema)
def get_build(
    build_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get build by ID.

    Args:
        build_id: Build UUID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Build details with parts list

    Raises:
        HTTPException: If build not found
    """
    build = db.query(Build).filter(
        Build.id == build_id,
        Build.deleted_at.is_(None),
    ).first()

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    # Get parts with quantities
    stmt = select(build_parts.c.part_id, build_parts.c.quantity).where(build_parts.c.build_id == build.id)
    result = db.execute(stmt).all()

    build_dict = BuildSchema.model_validate(build).model_dump()
    part_responses = []
    for part_id, quantity in result:
        part = db.query(Part).filter(Part.id == part_id).first()
        if part:
            part_responses.append(BuildPartResponse(
                part_id=part_id,
                quantity=quantity,
                part_name=part.name,
                part_sku=part.sku
            ))

    build_dict['parts'] = part_responses
    return build_dict


@router.patch("/{build_id}", response_model=BuildSchema)
def update_build(
    build_id: UUID,
    build_data: BuildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update build details.

    Args:
        build_id: Build UUID
        build_data: Build update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated build

    Raises:
        HTTPException: If build not found
    """
    build = db.query(Build).filter(
        Build.id == build_id,
        Build.deleted_at.is_(None),
    ).first()

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    # Update fields (excluding parts)
    update_data = build_data.model_dump(exclude_unset=True, exclude={'parts'})
    for field, value in update_data.items():
        setattr(build, field, value)

    # Update parts if provided
    if build_data.parts is not None:
        # Validate all parts exist
        for part_item in build_data.parts:
            part = db.query(Part).filter(Part.id == part_item.part_id, Part.deleted_at.is_(None)).first()
            if not part:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Part with ID {part_item.part_id} not found",
                )

        # Delete existing parts relationships
        delete_stmt = build_parts.delete().where(build_parts.c.build_id == build.id)
        db.execute(delete_stmt)

        # Add new parts
        for part_item in build_data.parts:
            stmt = build_parts.insert().values(
                build_id=build.id,
                part_id=part_item.part_id,
                quantity=part_item.quantity
            )
            db.execute(stmt)

    db.commit()
    db.refresh(build)

    return build


@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_build(
    build_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete a build.

    Args:
        build_id: Build UUID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If build not found
    """
    build = db.query(Build).filter(
        Build.id == build_id,
        Build.deleted_at.is_(None),
    ).first()

    if not build:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Build not found",
        )

    # Soft delete
    build.deleted_at = datetime.utcnow()
    db.commit()
