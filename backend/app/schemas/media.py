"""Media schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class MediaBase(BaseModel):
    alt_text: Optional[str] = Field(None, max_length=255)
    caption: Optional[str] = None


class MediaUpdate(MediaBase):
    pass


class MediaResponse(MediaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    original_filename: str
    file_path: str
    file_url: str
    mime_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    variants: Dict[str, Any] = {}
    created_at: datetime


class MediaListResponse(BaseModel):
    items: List[MediaResponse]
    total: int
    page: int
    limit: int
