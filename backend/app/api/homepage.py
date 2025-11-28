"""
Homepage content API endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.homepage import HomepageContent
from app.models.user import User
from app.schemas.homepage import HomepageContentResponse, HomepageContentCreate, HomepageContentUpdate

router = APIRouter(prefix="/homepage", tags=["Homepage"])


# =============================================================================
# PUBLIC ENDPOINTS
# =============================================================================

@router.get("/content", response_model=List[HomepageContentResponse])
async def list_homepage_content(
    db: Session = Depends(get_db)
):
    """
    List all active homepage content sections.
    """
    return db.query(HomepageContent).filter(HomepageContent.is_active == True).all()


@router.get("/content/{key}", response_model=HomepageContentResponse)
async def get_homepage_content_by_key(
    key: str,
    db: Session = Depends(get_db)
):
    """
    Get specific homepage content by key (e.g., 'hero', 'interests').
    """
    content = db.query(HomepageContent).filter(
        HomepageContent.key == key,
        HomepageContent.is_active == True
    ).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Homepage content '{key}' not found"
        )

    return content


# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@router.get("/admin/content", response_model=List[HomepageContentResponse])
async def admin_list_homepage_content(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: List all homepage content (including inactive).
    """
    return db.query(HomepageContent).all()


@router.post("/admin/content", response_model=HomepageContentResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_homepage_content(
    content_data: HomepageContentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Create new homepage content section.
    """
    # Check for duplicate key
    existing = db.query(HomepageContent).filter(HomepageContent.key == content_data.key).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Homepage content with key '{content_data.key}' already exists"
        )

    content = HomepageContent(
        key=content_data.key,
        content=content_data.content,
        is_active=content_data.is_active
    )

    db.add(content)
    db.commit()
    db.refresh(content)

    return content


@router.put("/admin/content/{key}", response_model=HomepageContentResponse)
async def admin_update_homepage_content(
    key: str,
    content_data: HomepageContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Update homepage content by key.
    """
    content = db.query(HomepageContent).filter(HomepageContent.key == key).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Homepage content '{key}' not found"
        )

    update_data = content_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)

    db.commit()
    db.refresh(content)

    return content


@router.delete("/admin/content/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_homepage_content(
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin: Delete homepage content by key.
    """
    content = db.query(HomepageContent).filter(HomepageContent.key == key).first()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Homepage content '{key}' not found"
        )

    db.delete(content)
    db.commit()
