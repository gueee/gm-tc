"""Seed script for initial data."""

from app.db.base import SessionLocal, engine, Base
from app.models.category import Category
from app.models.user import User
from app.core.security import get_password_hash

# Default categories matching the landing page design
DEFAULT_CATEGORIES = [
    {
        "name": "3D Printing",
        "slug": "3d-printing",
        "description": "Design and manufacturing with precision",
        "icon": "Printer",
        "color": "#D4A574",
        "sort_order": 0,
    },
    {
        "name": "Programming",
        "slug": "programming",
        "description": "Building solutions through code",
        "icon": "Code",
        "color": "#D4A574",
        "sort_order": 1,
    },
    {
        "name": "Electronics",
        "slug": "electronics",
        "description": "Microcontrollers and circuit design",
        "icon": "Cpu",
        "color": "#D4A574",
        "sort_order": 2,
    },
    {
        "name": "FPV Drones",
        "slug": "fpv-drones",
        "description": "High-speed aerial innovation",
        "icon": "Plane",
        "color": "#D4A574",
        "sort_order": 3,
    },
    {
        "name": "Motorcycles",
        "slug": "motorcycles",
        "description": "Engineering meets adventure",
        "icon": "Bike",
        "color": "#D4A574",
        "sort_order": 4,
    },
    {
        "name": "AI Development",
        "slug": "ai-development",
        "description": "Exploring intelligent systems",
        "icon": "Brain",
        "color": "#D4A574",
        "sort_order": 5,
    },
    {
        "name": "CNC Machining",
        "slug": "cnc-machining",
        "description": "Precision manufacturing",
        "icon": "Cog",
        "color": "#D4A574",
        "sort_order": 6,
    },
    {
        "name": "Laser Engraving",
        "slug": "laser-engraving",
        "description": "Art meets technology",
        "icon": "Sparkles",
        "color": "#D4A574",
        "sort_order": 7,
    },
]


def seed_categories(db):
    """Seed default categories."""
    existing = db.query(Category).count()
    if existing > 0:
        print(f"Categories already exist ({existing}). Skipping seed.")
        return

    for cat_data in DEFAULT_CATEGORIES:
        category = Category(**cat_data)
        db.add(category)

    db.commit()
    print(f"Seeded {len(DEFAULT_CATEGORIES)} categories.")


def create_admin_user(db, email: str, password: str, full_name: str = "Admin"):
    """Create admin user if not exists."""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"User {email} already exists.")
        return existing

    user = User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        is_superuser=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created admin user: {email}")
    return user


def main():
    """Run seed operations."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

    db = SessionLocal()
    try:
        seed_categories(db)

        # Optionally create admin user (uncomment and set credentials)
        # create_admin_user(db, "admin@gm-tc.tech", "your-secure-password", "Admin")

    finally:
        db.close()

    print("Seed complete!")


if __name__ == "__main__":
    main()
