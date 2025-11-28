"""Tag schemas for request/response validation."""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = Field(None, max_length=100)


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime


class TagListResponse(BaseModel):
    items: List[TagResponse]
    total: int
