"""Blog post management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID
from datetime import datetime
import re
from app.db import get_db
from app.models.blog import BlogPost as BlogPostModel
from app.schemas.blog import (
    BlogPost,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostList,
)
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/blog", tags=["blog"])


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title."""
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    slug = re.sub(r"[-\s]+", "-", slug)
    slug = slug.strip("-")
    return slug[:255]


@router.get("/posts", response_model=BlogPostList)
def list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List published blog posts (public endpoint).

    Args:
        page: Page number (starts at 1)
        per_page: Items per page
        search: Search in title or content
        db: Database session

    Returns:
        Paginated list of published blog posts
    """
    query = db.query(BlogPostModel).filter(
        BlogPostModel.deleted_at.is_(None),
        BlogPostModel.published == True
    )

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BlogPostModel.title.ilike(search_term),
                BlogPostModel.content.ilike(search_term),
                BlogPostModel.excerpt.ilike(search_term)
            )
        )

    # Get total count
    total = query.count()

    # Calculate pagination
    total_pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page

    # Get paginated results, ordered by published_at desc
    posts = query.order_by(
        BlogPostModel.published_at.desc().nulls_last(),
        BlogPostModel.created_at.desc()
    ).offset(offset).limit(per_page).all()

    return {
        "items": posts,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/posts/{slug}", response_model=BlogPost)
def get_post_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    """Get a specific blog post by slug (public endpoint).

    Args:
        slug: Post slug
        db: Database session

    Returns:
        Blog post details

    Raises:
        HTTPException: If post not found or not published
    """
    post = db.query(BlogPostModel).filter(
        BlogPostModel.slug == slug,
        BlogPostModel.deleted_at.is_(None),
        BlogPostModel.published == True
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    return post


# Admin endpoints (require authentication)

@router.get("/admin/posts", response_model=BlogPostList)
def list_all_posts_admin(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    published_only: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all blog posts (admin endpoint - requires authentication).

    Args:
        page: Page number (starts at 1)
        per_page: Items per page
        search: Search in title or content
        published_only: Filter by published status
        db: Database session
        current_user: Current authenticated user

    Returns:
        Paginated list of all blog posts
    """
    query = db.query(BlogPostModel).filter(
        BlogPostModel.deleted_at.is_(None)
    )

    # Apply published filter
    if published_only is not None:
        query = query.filter(BlogPostModel.published == published_only)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BlogPostModel.title.ilike(search_term),
                BlogPostModel.content.ilike(search_term),
                BlogPostModel.excerpt.ilike(search_term)
            )
        )

    # Get total count
    total = query.count()

    # Calculate pagination
    total_pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page

    # Get paginated results
    posts = query.order_by(BlogPostModel.created_at.desc()).offset(offset).limit(per_page).all()

    return {
        "items": posts,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.post("/admin/posts", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: BlogPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new blog post (admin endpoint - requires authentication).

    Args:
        post_data: Blog post data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created blog post

    Raises:
        HTTPException: If slug already exists
    """
    # Generate slug if not provided
    slug = post_data.slug or generate_slug(post_data.title)

    # Check if slug already exists
    existing = db.query(BlogPostModel).filter(
        BlogPostModel.slug == slug,
        BlogPostModel.deleted_at.is_(None)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Slug '{slug}' already exists"
        )

    # Create new post
    new_post = BlogPostModel(
        title=post_data.title,
        slug=slug,
        content=post_data.content,
        excerpt=post_data.excerpt,
        featured_image=post_data.featured_image,
        published=post_data.published,
        author_id=current_user.id,
        published_at=datetime.utcnow() if post_data.published else None
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


@router.get("/admin/posts/{post_id}", response_model=BlogPost)
def get_post_admin(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific blog post by ID (admin endpoint - requires authentication).

    Args:
        post_id: Post UUID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Blog post details

    Raises:
        HTTPException: If post not found
    """
    post = db.query(BlogPostModel).filter(
        BlogPostModel.id == post_id,
        BlogPostModel.deleted_at.is_(None)
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    return post


@router.put("/admin/posts/{post_id}", response_model=BlogPost)
def update_post(
    post_id: UUID,
    post_data: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a blog post (admin endpoint - requires authentication).

    Args:
        post_id: Post UUID
        post_data: Updated blog post data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated blog post

    Raises:
        HTTPException: If post not found or slug conflict
    """
    post = db.query(BlogPostModel).filter(
        BlogPostModel.id == post_id,
        BlogPostModel.deleted_at.is_(None)
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Update fields
    update_data = post_data.model_dump(exclude_unset=True)

    # Handle slug update
    if "slug" in update_data and update_data["slug"]:
        slug = update_data["slug"]
        # Check if slug already exists (excluding current post)
        existing = db.query(BlogPostModel).filter(
            BlogPostModel.slug == slug,
            BlogPostModel.id != post_id,
            BlogPostModel.deleted_at.is_(None)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slug '{slug}' already exists"
            )
    elif "title" in update_data and not update_data.get("slug"):
        # Generate slug from new title if title changed but slug didn't
        update_data["slug"] = generate_slug(update_data["title"])

    # Handle published status change
    if "published" in update_data:
        if update_data["published"] and not post.published:
            # Publishing for the first time
            update_data["published_at"] = datetime.utcnow()
        elif not update_data["published"]:
            # Unpublishing
            update_data["published_at"] = None

    # Apply updates
    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    return post


@router.delete("/admin/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a blog post (soft delete, admin endpoint - requires authentication).

    Args:
        post_id: Post UUID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If post not found
    """
    post = db.query(BlogPostModel).filter(
        BlogPostModel.id == post_id,
        BlogPostModel.deleted_at.is_(None)
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )

    # Soft delete
    post.deleted_at = datetime.utcnow()
    db.commit()

    return None

