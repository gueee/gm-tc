"""
Seed script for GM-TC CMS database.
Run after creating the database schema to populate initial data.

Usage:
    cd backend
    source venv/bin/activate
    python seed_data.py
"""

import uuid
from datetime import datetime
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================================================
# CATEGORIES
# ============================================================================
CATEGORIES = [
    {
        "id": 1,
        "name": "3D Printing",
        "slug": "3d-printing",
        "description": "Perfect prints. Not the doormat kind.",
        "icon": "Printer",
        "color": "#D4A574",
        "sort_order": 0,
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Programming",
        "slug": "programming",
        "description": "Code that actually works. Shocking, I know.",
        "icon": "Code",
        "color": "#D4A574",
        "sort_order": 1,
        "is_active": True,
    },
    {
        "id": 3,
        "name": "Electronics",
        "slug": "electronics",
        "description": "Circuits smart enough to keep up with me",
        "icon": "Cpu",
        "color": "#D4A574",
        "sort_order": 2,
        "is_active": True,
    },
    {
        "id": 4,
        "name": "FPV Drones",
        "slug": "fpv-drones",
        "description": "Flying machines with zero input lag at the sticks",
        "icon": "Plane",
        "color": "#D4A574",
        "sort_order": 3,
        "is_active": True,
    },
    {
        "id": 5,
        "name": "Motorcycles",
        "slug": "motorcycles",
        "description": "The antidote to the grind",
        "icon": "Bike",
        "color": "#D4A574",
        "sort_order": 7,
        "is_active": True,
    },
    {
        "id": 6,
        "name": "AI Development",
        "slug": "ai-development",
        "description": "Teaching algorithms to outthink the average person",
        "icon": "Brain",
        "color": "#D4A574",
        "sort_order": 4,
        "is_active": True,
    },
    {
        "id": 7,
        "name": "CNC Machining",
        "slug": "cnc-machining",
        "description": "Tolerances that make machinists jealous",
        "icon": "Cog",
        "color": "#D4A574",
        "sort_order": 5,
        "is_active": True,
    },
    {
        "id": 8,
        "name": "Laser Engraving",
        "slug": "laser-engraving",
        "description": "Carving precision into existence in high resolution",
        "icon": "Sparkles",
        "color": "#D4A574",
        "sort_order": 6,
        "is_active": True,
    },
]

# ============================================================================
# HOMEPAGE CONTENT
# ============================================================================
HOMEPAGE_CONTENT = {
    "hero": {
        "headline": "I Just Kept Doing What I Loved",
        "tagline": "The universe took care of the rest.",
        "subtitle": "CAD Engineering • Klipper Development • Cutting-Edge 3D Printers"
    },
    "interests": {
        "interests": [
            {
                "icon": "Printer",
                "title": "3D Printing",
                "description": "Perfect prints. Not the doormat kind."
            },
            {
                "icon": "Code",
                "title": "Programming",
                "description": "Code that actually works. Shocking, I know."
            },
            {
                "icon": "Cpu",
                "title": "Electronics",
                "description": "Circuits smart enough to keep up with me."
            },
            {
                "icon": "Zap",
                "title": "FPV Drones",
                "description": "Flying machines with zero input lag."
            },
            {
                "icon": "Brain",
                "title": "AI Development",
                "description": "Teaching algorithms to outthink the average person."
            },
            {
                "icon": "Wrench",
                "title": "CNC Machining",
                "description": "Tolerances that make machinists jealous."
            },
            {
                "icon": "Sparkles",
                "title": "Laser Engraving",
                "description": "Carving precision into existence, 0.4mm layers or better."
            },
            {
                "icon": "Bike",
                "title": "Motorcycles",
                "description": "The antidote to the grind."
            }
        ]
    }
}

# ============================================================================
# SAMPLE ARTICLE
# ============================================================================
SAMPLE_ARTICLE = {
    "title": "G-Code Extrusion Rate Analysis: TPU Print Deep Dive",
    "slug": "gcode-extrusion-rate-analysis",
    "excerpt": "A detailed analysis of volumetric extrusion rates during a TPU 80A print job, examining flow characteristics across 25,940 extrusion segments.",
    "content": "",  # Empty - uses embedded React component
    "content_type": "article",
    "status": "published",
    "category_id": 1,  # 3D Printing
    "is_featured": False,
    "view_count": 0,
}

# ============================================================================
# DEFAULT ADMIN USER
# ============================================================================
DEFAULT_USER = {
    "email": "admin@gm-tc.tech",
    "password": "changeme123",  # Change this!
    "full_name": "Admin",
    "is_active": True,
    "is_superuser": True,
}


def seed_database():
    """
    Seed the database with initial data.
    """
    from app.db.session import SessionLocal
    from app.models.content import Category, Content
    from app.models.homepage import HomepageContent
    from app.models.user import User

    db = SessionLocal()

    try:
        # Seed Categories
        for cat_data in CATEGORIES:
            existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not existing:
                category = Category(**cat_data, created_at=datetime.utcnow())
                db.add(category)
                print(f"Added category: {cat_data['name']}")

        db.commit()

        # Seed Homepage Content
        for key, content in HOMEPAGE_CONTENT.items():
            existing = db.query(HomepageContent).filter(HomepageContent.key == key).first()
            if not existing:
                homepage = HomepageContent(
                    id=str(uuid.uuid4()),
                    key=key,
                    content=content,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(homepage)
                print(f"Added homepage content: {key}")

        db.commit()

        # Seed Sample Article
        existing_article = db.query(Content).filter(Content.slug == SAMPLE_ARTICLE["slug"]).first()
        if not existing_article:
            article = Content(
                **SAMPLE_ARTICLE,
                blocks={},
                created_at=datetime.utcnow(),
            )
            db.add(article)
            print(f"Added article: {SAMPLE_ARTICLE['title']}")

        db.commit()

        # Seed Admin User
        existing_user = db.query(User).filter(User.email == DEFAULT_USER["email"]).first()
        if not existing_user:
            user = User(
                id=str(uuid.uuid4()),
                email=DEFAULT_USER["email"],
                hashed_password=pwd_context.hash(DEFAULT_USER["password"]),
                full_name=DEFAULT_USER["full_name"],
                is_active=DEFAULT_USER["is_active"],
                is_superuser=DEFAULT_USER["is_superuser"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(user)
            print(f"Added user: {DEFAULT_USER['email']}")

        db.commit()
        print("\nDatabase seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

