# GM-TC CRM Project Status

**Last Updated**: October 30, 2025
**Project Phase**: Phase 0 - Foundation (In Progress)
**Contact**: office@gm-tc.tech

## Quick Start

### Backend Setup (Complete!)

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

Visit: http://localhost:8000/docs for API documentation

### What's Been Built

#### ✅ Phase 0 - Foundation (90% Complete)

**Backend Infrastructure** (Complete):
- ✅ FastAPI application scaffold
- ✅ SQLAlchemy ORM with Alembic migrations
- ✅ JWT authentication system
- ✅ User model and database schema
- ✅ Configuration management (pydantic-settings)
- ✅ Security utilities (password hashing, token generation)
- ✅ CORS middleware
- ✅ Development environment setup
- ✅ Code quality tools (Black, Ruff)
- ✅ Testing framework (pytest)

**Authentication API** (Complete):
- ✅ POST `/api/v1/auth/register` - User registration
- ✅ POST `/api/v1/auth/login` - User login with JWT tokens
- ✅ JWT access & refresh token system
- ✅ Protected route dependencies

**Development Tools** (Complete):
- ✅ Virtual environment with all dependencies
- ✅ Database migrations working
- ✅ Environment configuration
- ✅ Auto-reloading development server

**Deployment Documentation** (Complete):
- ✅ SSH key generated for Uberspace
- ✅ Comprehensive deployment guide (DEPLOYMENT.md)
- ✅ SSH setup scripts
- ✅ Server configuration documentation

#### 🔨 In Progress

**Frontend**:
- ⏳ React + TypeScript setup
- ⏳ Shadcn/ui + TailwindCSS configuration
- ⏳ Authentication UI
- ⏳ API client setup

#### 📋 Pending

**Phase 1 - Core Entities** (Weeks 3-5):
- Parts Management Module
- Supplier Management Module
- Customer Management Module

**Phase 2 - Order & Build Management** (Weeks 6-8):
- Purchase Orders
- Printer Builds & BOM
- Customer Orders

**Phase 3 - Operations** (Weeks 9-10):
- Delivery Management
- Inventory Automation

**Phase 4 - Financial** (Weeks 11-12):
- Invoicing
- Reporting

**Phase 5 - Polish** (Weeks 13-14):
- Production deployment
- Security hardening
- Documentation

## Project Structure

```
gm-tc/
├── backend/                    # FastAPI Backend (✅ Complete)
│   ├── alembic/               # Database migrations
│   │   └── versions/          # Migration files
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth.py        # ✅ Authentication endpoints
│   │   │   └── deps.py        # ✅ Dependencies
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # ✅ Settings
│   │   │   └── security.py    # ✅ Security utilities
│   │   ├── db/                # ✅ Database session
│   │   ├── models/            # SQLAlchemy models
│   │   │   └── user.py        # ✅ User model
│   │   ├── schemas/           # Pydantic schemas
│   │   │   └── user.py        # ✅ User schemas
│   │   ├── services/          # Business logic (empty)
│   │   └── utils/             # Utilities (empty)
│   ├── tests/                 # Tests (pending)
│   ├── venv/                  # ✅ Virtual environment
│   ├── main.py                # ✅ Application entry
│   ├── requirements.txt       # ✅ Dependencies
│   ├── .env                   # ✅ Environment config
│   └── gmtc_crm.db           # ✅ SQLite database
│
├── frontend/                  # React Frontend (⏳ Pending)
│
├── docs/                      # Additional documentation
│
├── scripts/                   # Utility scripts
│
├── CLAUDE.md                  # ✅ Development guide
├── STRATEGY.md                # ✅ Implementation strategy
├── DEPLOYMENT.md              # ✅ Uberspace deployment guide
├── SSH_SETUP.md               # ✅ SSH configuration guide
├── README_SSH.md              # ✅ Quick SSH start
└── README.md                  # ✅ Project overview
```

## Technology Stack

### Backend (Implemented)
- **Framework**: FastAPI 0.115.0
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: SQLAlchemy 2.0.35
- **Migrations**: Alembic 1.13.3
- **Auth**: JWT (python-jose 3.3.0)
- **Password Hashing**: Passlib 1.7.4 with bcrypt
- **Validation**: Pydantic 2.9.2
- **Testing**: Pytest 8.3.3
- **Code Quality**: Black 24.10.0, Ruff 0.7.3

### Frontend (Pending)
- **Framework**: React + TypeScript
- **UI**: Shadcn/ui + TailwindCSS
- **State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Build**: Vite

### Deployment
- **Server**: gmtc.uber.space
- **Domain**: gm-tc.tech
- **Hosting**: Uberspace.de
- **Web Server**: Nginx (reverse proxy)
- **Process Manager**: supervisord

## API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /` - API information

### Authentication (`/api/v1/auth/`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT tokens

### API Documentation
- `GET /docs` - Swagger UI (development only)
- `GET /redoc` - ReDoc (development only)

## Development Workflow

### Backend Development

```bash
# Activate virtualenv
cd backend
source venv/bin/activate

# Run development server
uvicorn main:app --reload

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Run tests
pytest

# Format code
black .

# Lint code
ruff check .
```

### Database Management

```bash
# SQLite (local development)
DATABASE_URL=sqlite:///./gmtc_crm.db

# PostgreSQL (production on Uberspace)
DATABASE_URL=postgresql://gmtc:@localhost:[PORT]/gmtc_crm
```

## Next Steps

### Immediate (This Week)

1. **Frontend Setup**:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   # Add Shadcn/ui, TailwindCSS, TanStack Query
   ```

2. **Test Authentication**:
   - Create a test user via API
   - Test login functionality
   - Verify JWT token generation

3. **Begin Phase 1**:
   - Design Parts model and schema
   - Create Parts API endpoints
   - Build Parts UI components

### This Month

1. Complete Phase 1 (Core Entities):
   - Parts Management (CRUD + inventory)
   - Supplier Management (CRUD + contacts)
   - Customer Management (CRUD + history)

2. Deploy to Uberspace:
   - Install SSH key: `./install_ssh_key.sh`
   - Follow DEPLOYMENT.md
   - Set up PostgreSQL database
   - Configure systemd service
   - Deploy initial version

## Testing the Current Build

### 1. Start the API

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### 2. Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gm-tc.tech","password":"testpass123","full_name":"Test User"}'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login?email=test@gm-tc.tech&password=testpass123"
```

### 3. Use Swagger UI

Visit http://localhost:8000/docs for interactive API documentation.

## Environment Variables

See `backend/.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - Application secret
- `JWT_SECRET_KEY` - JWT signing key
- `ALLOWED_ORIGINS` - CORS origins
- `SMTP_*` - Email configuration (office@gm-tc.tech)

## Database Schema

### Current Tables

**users**:
- `id` (UUID, PK)
- `email` (String, unique, indexed)
- `hashed_password` (String)
- `full_name` (String, nullable)
- `is_active` (Boolean)
- `is_superuser` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `deleted_at` (DateTime, nullable)

### Upcoming Tables (Phase 1)

- `suppliers`
- `customers`
- `parts`
- `suppliers_parts` (junction)
- Plus many more (see STRATEGY.md for complete schema)

## Documentation

- **[STRATEGY.md](STRATEGY.md)** - Complete 14-week implementation plan
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Uberspace deployment guide
- **[CLAUDE.md](CLAUDE.md)** - AI assistant development guide
- **[SSH_SETUP.md](SSH_SETUP.md)** - SSH key configuration
- **[backend/README.md](backend/README.md)** - Backend-specific docs

## Support & Resources

- **Email**: office@gm-tc.tech
- **Repository**: https://github.com/gueee/gm-tc
- **Domain**: https://gm-tc.tech
- **Server**: gmtc.uber.space
- **Uberspace Manual**: https://manual.uberspace.de

## Progress Tracking

- **Phase 0**: 90% complete (frontend pending)
- **Phase 1**: 0% (starts next)
- **Overall**: ~13% of total project
- **Timeline**: On track for 14-week delivery

---

**Note**: This is a living document. Update after each major milestone or phase completion.
