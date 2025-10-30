# Getting Started with GM-TC CRM

Welcome! This guide will get you up and running with the GM-TC CRM system.

## What's Been Built

✅ **Complete Backend API** with authentication, database, and development tools
✅ **Deployment Infrastructure** ready for Uberspace hosting
✅ **Comprehensive Documentation** for development and deployment
✅ **14-Week Roadmap** to full production system

## Quick Start (5 Minutes)

### 1. Start the Backend API

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### 2. Test the API

Open your browser to: **http://localhost:8000/docs**

You'll see the interactive API documentation (Swagger UI).

### 3. Try Authentication

In the Swagger UI:

1. Click on `POST /api/v1/auth/register`
2. Click "Try it out"
3. Use this example:
```json
{
  "email": "admin@gm-tc.tech",
  "password": "SecurePassword123",
  "full_name": "Admin User",
  "is_active": true
}
```
4. Click "Execute"
5. You should get a 201 response with your new user!

Now try logging in:
1. Click on `POST /api/v1/auth/login`
2. Enter your email and password
3. You'll get JWT access and refresh tokens!

## Project Overview

### Current Status
- **Phase**: Phase 0 (Foundation) - 90% Complete
- **Backend**: ✅ Fully functional FastAPI + SQLAlchemy + JWT
- **Frontend**: ⏳ Next step
- **Database**: ✅ Migrations working (SQLite locally, PostgreSQL for production)

### What Works Right Now

1. **User Registration & Authentication**
   - Create users
   - Login with email/password
   - JWT access tokens (15 min expiry)
   - JWT refresh tokens (7 day expiry)
   - Protected route authentication

2. **Database**
   - Automatic migrations with Alembic
   - User model with audit fields
   - SQLite for development
   - Ready for PostgreSQL in production

3. **Development Tools**
   - Auto-reload development server
   - Interactive API documentation
   - Code formatting (Black)
   - Linting (Ruff)
   - Testing framework (Pytest)

## Project Structure

```
gm-tc/
├── backend/              # FastAPI backend (working!)
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config & security
│   │   ├── db/          # Database
│   │   ├── models/      # SQLAlchemy models
│   │   └── schemas/     # Pydantic schemas
│   ├── alembic/         # Database migrations
│   ├── main.py          # Application entry
│   └── .env             # Configuration
│
├── frontend/            # React frontend (next step)
│
├── STRATEGY.md          # 14-week implementation plan
├── DEPLOYMENT.md        # Uberspace deployment guide
├── PROJECT_STATUS.md    # Current progress
└── README.md            # Project overview
```

## Development Commands

### Backend

```bash
cd backend
source venv/bin/activate

# Run dev server
uvicorn main:app --reload

# Create migration
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

## Next Steps

### For Development

1. **Frontend Setup** (Next):
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```

2. **Add First Business Module** (Parts Management):
   - Create Parts model
   - Add Parts API endpoints
   - Build Parts UI

3. **Deploy to Uberspace**:
   - Install SSH key: `./install_ssh_key.sh`
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)

### For Understanding the Codebase

Read these in order:
1. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - See what's done and what's next
2. **[STRATEGY.md](STRATEGY.md)** - Understand the full plan
3. **[backend/README.md](backend/README.md)** - Backend details
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - When ready to deploy

## Common Tasks

### Add a New API Endpoint

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create route in `app/api/`
4. Register route in `main.py`
5. Create migration: `alembic revision --autogenerate -m "add model"`
6. Apply: `alembic upgrade head`

### Test API Manually

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gm-tc.tech","password":"test123","full_name":"Test"}'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login?email=test@gm-tc.tech&password=test123"
```

### Access Database

```bash
cd backend

# SQLite (development)
sqlite3 gmtc_crm.db
.tables
.schema users
SELECT * FROM users;
```

## Configuration

Edit `backend/.env` to change settings:

```bash
# Database
DATABASE_URL=sqlite:///./gmtc_crm.db  # Local development
# DATABASE_URL=postgresql://...        # Production

# Security (CHANGE THESE!)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# Email
SMTP_USER=office@gm-tc.tech
SMTP_FROM=office@gm-tc.tech

# CORS (add your frontend URL)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Troubleshooting

### "Module not found" errors
```bash
cd backend
source venv/bin/activate  # Make sure venv is activated!
```

### "Database locked" (SQLite)
```bash
# Stop the server and restart
# Or switch to PostgreSQL for production
```

### "CORS error" in frontend
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Migration conflicts
```bash
alembic downgrade -1  # Rollback one migration
alembic upgrade head  # Re-apply
```

## Get Help

- **Documentation**: See the files in the root directory
- **Email**: office@gm-tc.tech
- **API Docs**: http://localhost:8000/docs (when server running)

## Deployment

When ready to deploy to production:

1. **Set up SSH**:
   ```bash
   ./install_ssh_key.sh
   ./setup_ssh_config.sh
   ```

2. **Follow deployment guide**:
   See [DEPLOYMENT.md](DEPLOYMENT.md) for complete instructions

3. **Production checklist**:
   - Change SECRET_KEY and JWT_SECRET_KEY
   - Use PostgreSQL instead of SQLite
   - Set ENVIRONMENT=production
   - Configure email settings
   - Set up SSL/HTTPS
   - Configure backups

## What's Next?

According to the [STRATEGY.md](STRATEGY.md):

### Phase 1 (Weeks 3-5) - Core Entities
- ✅ Parts Management Module
- ✅ Supplier Management Module
- ✅ Customer Management Module

### Phase 2 (Weeks 6-8) - Orders & Builds
- Purchase Order Management
- Printer Build System (BOM)
- Customer Order Tracking

### Phase 3-5 (Weeks 9-14)
- Delivery Management
- Billing & Invoicing
- Reports & Analytics
- Production Deployment

## Technology Stack

- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (SQLite for dev)
- **Frontend**: React + TypeScript (pending)
- **UI**: Shadcn/ui + TailwindCSS (pending)
- **Hosting**: Uberspace.de
- **Domain**: gm-tc.tech

---

**You're all set!** Start the backend and explore the API at http://localhost:8000/docs

Need help? Check [PROJECT_STATUS.md](PROJECT_STATUS.md) for current status or [STRATEGY.md](STRATEGY.md) for the full plan.
