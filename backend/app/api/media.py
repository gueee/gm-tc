"""
Media upload API endpoint.
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(tags=["Media"])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Upload directory - will be created if doesn't exist
UPLOAD_DIR = "/var/www/virtual/gmtc/html/uploads"


def get_safe_filename(original_filename: str) -> str:
    """Generate a safe unique filename."""
    ext = os.path.splitext(original_filename)[1].lower()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    return f"{timestamp}_{unique_id}{ext}"


@router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image file.
    Returns the URL to access the uploaded file.
    """
    # Check file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // 1024 // 1024}MB"
        )

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate safe filename
    safe_filename = get_safe_filename(file.filename or "image.jpg")
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)

    # Return URL
    url = f"/uploads/{safe_filename}"

    return JSONResponse({
        "url": url,
        "filename": safe_filename,
        "size": len(content)
    })

