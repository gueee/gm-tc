"""
Homepage content schemas for API requests/responses.
"""
from datetime import datetime
from typing import Optional, Any, List
from pydantic import BaseModel


class HomepageContentBase(BaseModel):
    key: str
    content: dict
    is_active: Optional[bool] = True


class HomepageContentCreate(HomepageContentBase):
    pass


class HomepageContentUpdate(BaseModel):
    content: Optional[dict] = None
    is_active: Optional[bool] = None


class HomepageContentResponse(HomepageContentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Hero section content structure
class HeroContent(BaseModel):
    headline: str
    tagline: str
    subtitle: str


# Interest item structure
class InterestItem(BaseModel):
    icon: str
    title: str
    description: str


class InterestsContent(BaseModel):
    interests: List[InterestItem]
