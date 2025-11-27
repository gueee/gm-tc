"""Homepage content schemas."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class HomepageContentBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=100)
    content: Dict[str, Any] = Field(..., description="JSON content structure")
    is_active: bool = True


class HomepageContentCreate(HomepageContentBase):
    pass


class HomepageContentUpdate(BaseModel):
    content: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class HomepageContentInDB(HomepageContentBase):
    model_config = {"from_attributes": True}

    id: UUID
    created_at: datetime
    updated_at: datetime


class HomepageContent(HomepageContentInDB):
    pass

