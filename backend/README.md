# GM-TC CRM Backend

FastAPI backend for the GM-TC CRM system.

## Setup

### Prerequisites
- Python 3.11+
- PostgreSQL 14+

### Installation

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
alembic upgrade head
```

## Development

### Run Development Server
```bash
uvicorn main:app --reload --port 8000
```

Or:
```bash
python main.py
```

### Create Database Migration
```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

## Testing

### Run Tests
```bash
pytest
```

### Run Tests with Coverage
```bash
pytest --cov=app tests/
```

## Code Quality

### Format Code
```bash
black .
```

### Lint Code
```bash
ruff check .
```

### Fix Linting Issues
```bash
ruff check --fix .
```

## API Documentation

When running in development mode, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Alembic environment
├── app/
│   ├── api/             # API routes
│   │   ├── auth.py      # Authentication endpoints
│   │   └── deps.py      # Dependencies
│   ├── core/            # Core functionality
│   │   ├── config.py    # Configuration
│   │   └── security.py  # Security utilities
│   ├── db/              # Database
│   │   └── base.py      # Database session
│   ├── models/          # SQLAlchemy models
│   │   └── user.py      # User model
│   ├── schemas/         # Pydantic schemas
│   │   └── user.py      # User schemas
│   ├── services/        # Business logic
│   └── utils/           # Utilities
├── tests/               # Test files
├── main.py             # Application entry point
└── requirements.txt    # Python dependencies
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Application secret key
- `JWT_SECRET_KEY`: JWT signing key
- `ALLOWED_ORIGINS`: CORS allowed origins
