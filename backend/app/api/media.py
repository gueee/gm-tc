"""Media API routes for file uploads."""

import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from PIL import Image
from app.db import get_db
from app.core.config import settings
from app.models.media import Media
from app.schemas.media import MediaResponse, MediaUpdate, MediaListResponse
from app.api.deps import require_admin

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
}


def get_upload_dir() -> Path:
    """Get and ensure upload directory exists."""
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


@router.get("", response_model=MediaListResponse)
def list_media(
    mime_type: str = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """List all media files (admin only)."""
    query = db.query(Media)

    if mime_type:
        query = query.filter(Media.mime_type.startswith(mime_type))

    total = query.count()
    items = query.order_by(Media.created_at.desc())\
        .offset((page - 1) * limit)\
        .limit(limit)\
        .all()

    return MediaListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{id}", response_model=MediaResponse)
def get_media(id: int, db: Session = Depends(get_db)):
    """Get media by ID."""
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    return media


@router.post("/upload", response_model=MediaResponse)
async def upload_media(
    file: UploadFile = File(...),
    alt_text: str = None,
    caption: str = None,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Upload a media file (admin only)."""
    # Validate file type
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed"
        )

    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size is {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB"
        )

    # Generate unique filename
    ext = ALLOWED_EXTENSIONS[file.content_type]
    unique_filename = f"{uuid.uuid4()}{ext}"

    # Save file
    upload_dir = get_upload_dir()
    file_path = upload_dir / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    # Get image dimensions if applicable
    width, height = None, None
    if file.content_type.startswith("image/") and file.content_type != "image/svg+xml":
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception:
            pass

    # Create database record
    media = Media(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_url=f"/uploads/{unique_filename}",
        mime_type=file.content_type,
        file_size=len(content),
        width=width,
        height=height,
        alt_text=alt_text,
        caption=caption,
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    return media


@router.put("/{id}", response_model=MediaResponse)
def update_media(
    id: int,
    data: MediaUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Update media metadata (admin only)."""
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(media, field, value)

    db.commit()
    db.refresh(media)

    return media


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_admin),
):
    """Delete media file (admin only)."""
    media = db.query(Media).filter(Media.id == id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )

    # Delete physical file
    try:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
    except Exception:
        pass  # File might already be deleted

    db.delete(media)
    db.commit()
