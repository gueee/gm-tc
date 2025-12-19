# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/CMS website for [gm-tc.tech](https://gm-tc.tech).

**Stack:**
- **Backend**: FastAPI + SQLite + SQLAlchemy (Python 3)
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Charts**: Plotly.js (react-plotly.js)
- **Icons**: Lucide React
- **Hosting**: Uberspace.de (Apache for static, uvicorn for API)

## Development Commands

### Backend
```bash
cd backend
source venv/bin/activate        # Activate virtual environment
uvicorn main:app --reload --port 8000  # Start dev server
alembic upgrade head            # Run migrations
python seed_data.py             # Seed database
```

### Frontend
```bash
cd frontend
npm run dev      # Start dev server (Vite)
npm run build    # Build for production (tsc + vite build)
npm run lint     # ESLint
```

### Deployment (to Uberspace)
```bash
# Frontend: build locally, upload to server
cd frontend && npm run build
rsync -avz dist/ gmtc@gmtc.uber.space:/var/www/virtual/gmtc/html/

# Backend: sync code and restart
rsync -avz --exclude 'venv' --exclude '__pycache__' backend/ gmtc@gmtc.uber.space:~/repos/gm-tc/backend/
ssh gmtc@gmtc.uber.space "supervisorctl restart gmtc-api"
```

## Architecture

### Backend (`backend/`)
- `main.py` - FastAPI app entry point
- `app/api/` - API routers:
  - `content.py` - CMS content endpoints (`/api/v1/content`)
  - `homepage.py` - Homepage content (`/api/v1/homepage`)
  - `auth.py` - JWT authentication
- `app/models/` - SQLAlchemy models (Contents, Categories, HomepageContent, Users)
- `app/schemas/` - Pydantic schemas
- `app/core/config.py` - Settings (uses `gmtc_crm.db` NOT `gmtc.db`)

### Frontend (`frontend/src/`)
- `pages/` - Route components (HomePage, ArticlePage, ArticlesPage, LoginPage)
- `components/` - Reusable components
- `services/` - API clients (axios-based)
- `contexts/` - React contexts (AuthContext)

### Key Patterns

**Embedded Components:** ArticlePage can render React components instead of markdown for special articles:
```tsx
// In ArticlePage.tsx
const EMBEDDED_COMPONENTS: Record<string, React.FC> = {
  'gcode-extrusion-rate-analysis': ExtrusionAnalysisChart,
};
```

**Block-Based Content:** Articles use a `blocks` JSON field for structured content with BlockRenderer.

**Homepage Content:** Stored in `homepage_content` table with keys like `hero` and `interests`.

## API Endpoints

- `GET /api/v1/content` - List published articles
- `GET /api/v1/content/{slug}` - Get article by slug
- `GET /api/v1/homepage/content/{key}` - Get homepage section (hero, interests)
- `POST /api/v1/auth/login` - JWT login
- Admin CRUD endpoints require JWT authentication

## Database

SQLite file: `backend/gmtc_crm.db`

Tables: `users`, `categories`, `contents`, `homepage_content`, `media`, `tags`

## Design System

TailwindCSS with custom colors:
- `steel-300` to `steel-900` - Dark grays for backgrounds
- `copper-200` to `copper-500` - Accent highlights
- Dark mode by default

## Skills Reference

For detailed context, see skill files in `skills/`:
- `cms-development/` - Backend, database, API
- `web-design/` - Frontend, UI, styling
- `uberspace-deployment/` - Server config, deployment
- `debugging/` - Troubleshooting

## Safety Rules

**Before ANY destructive operation** (delete, rm, force operations):
1. Check `git status`
2. Create recovery point: `git add -A && git commit -m "backup: before [operation]"`
3. Verify what will be deleted
4. Then proceed

**Never commit**: `.env`, `venv/`, `node_modules/`, `*.db`, `__pycache__/`
