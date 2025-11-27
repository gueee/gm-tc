"""Homepage CMS endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.homepage import HomepageContent as HomepageContentModel
from app.schemas.homepage import (
    HomepageContent,
    HomepageContentCreate,
    HomepageContentUpdate,
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/homepage", tags=["homepage"])


@router.get("/content/{key}", response_model=HomepageContent)
def get_content(
    key: str,
    db: Session = Depends(get_db),
):
    """Get homepage content by key (public endpoint).

    Args:
        key: Content key (e.g., "hero", "interests")
        db: Database session

    Returns:
        Homepage content

    Raises:
        HTTPException: If content not found
    """
    content = db.query(HomepageContentModel).filter(
        HomepageContentModel.key == key,
        HomepageContentModel.is_active == True
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with key '{key}' not found"
        )

    return content


@router.get("/content", response_model=list[HomepageContent])
def list_all_content(
    db: Session = Depends(get_db),
):
    """List all active homepage content (public endpoint).

    Args:
        db: Database session

    Returns:
        List of homepage content
    """
    contents = db.query(HomepageContentModel).filter(
        HomepageContentModel.is_active == True
    ).all()

    return contents


# Admin endpoints (require authentication)

@router.get("/admin/content", response_model=list[HomepageContent])
def list_all_content_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all homepage content (admin endpoint).

    Args:
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of all homepage content
    """
    contents = db.query(HomepageContentModel).all()
    return contents


@router.post("/admin/content", response_model=HomepageContent, status_code=status.HTTP_201_CREATED)
def create_content(
    content_data: HomepageContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create homepage content (admin endpoint).

    Args:
        content_data: Homepage content data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created homepage content

    Raises:
        HTTPException: If key already exists
    """
    # Check if key already exists
    existing = db.query(HomepageContentModel).filter(
        HomepageContentModel.key == content_data.key
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Content with key '{content_data.key}' already exists"
        )

    # Create new content
    new_content = HomepageContentModel(
        key=content_data.key,
        content=content_data.content,
        is_active=content_data.is_active
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return new_content


@router.put("/admin/content/{key}", response_model=HomepageContent)
def update_content(
    key: str,
    content_data: HomepageContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update homepage content (admin endpoint).

    Args:
        key: Content key
        content_data: Updated content data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated homepage content

    Raises:
        HTTPException: If content not found
    """
    content = db.query(HomepageContentModel).filter(
        HomepageContentModel.key == key
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with key '{key}' not found"
        )

    # Update fields
    update_data = content_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/admin/content/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete homepage content (admin endpoint).

    Args:
        key: Content key
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If content not found
    """
    content = db.query(HomepageContentModel).filter(
        HomepageContentModel.key == key
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with key '{key}' not found"
        )

    db.delete(content)
    db.commit()

