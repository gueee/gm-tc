# GM-TC Portfolio CMS - Complete Build Guide

## Overview

Personal portfolio/CMS website for gm-tc.tech with:
- **Backend**: FastAPI + SQLite + SQLAlchemy
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Hosting**: Uberspace.de (Apache for static, uvicorn for API)

## Project Structure

```
gm-tc/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # JWT authentication
│   │   │   ├── blog.py          # Legacy blog endpoints (unused)
│   │   │   ├── content.py       # CMS content API (/api/v1/content)
│   │   │   ├── homepage.py      # Homepage content API (/api/v1/homepage)
│   │   │   └── deps.py          # Dependencies (get_db, get_current_user)
│   │   ├── core/
│   │   │   ├── config.py        # Settings (DATABASE_URL, JWT_SECRET, etc.)
│   │   │   └── security.py      # Password hashing, JWT tokens
│   │   ├── db/
│   │   │   └── session.py       # SQLAlchemy session
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── content.py       # Contents, Categories, Tags, Media
│   │   │   └── homepage.py      # HomepageContent
│   │   └── schemas/
│   │       ├── content.py
│   │       └── homepage.py
│   ├── alembic/                 # Database migrations
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   └── gmtc_crm.db             # SQLite database
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   ├── HomePage/
    │   │   │   ├── HeroSection.tsx      # Dynamic hero from CMS
    │   │   │   ├── InterestsShowcase.tsx # Dynamic interests grid
    │   │   │   └── LatestArticles.tsx   # Latest articles from CMS
    │   │   ├── Blog/
    │   │   │   └── MarkdownRenderer.tsx # Markdown to HTML
    │   │   └── charts/
    │   │       ├── ExtrusionAnalysisChart.tsx  # Plotly chart
    │   │       └── chartData.ts                # 509 data points
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── ArticlePage.tsx          # Single article with embedded components
    │   │   ├── ArticlesPage.tsx         # Articles listing
    │   │   ├── LoginPage.tsx
    │   │   └── HomepageAdminPage.tsx    # CMS admin panel
    │   ├── services/
    │   │   ├── api.ts                   # Axios instance
    │   │   ├── blog.ts                  # Content API service
    │   │   └── homepage.ts              # Homepage API service
    │   └── contexts/
    │       └── AuthContext.tsx
    └── index.html

```

---

## Database Schema

### Core CMS Tables

#### `categories`
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),           -- Lucide icon name
    color VARCHAR(7),           -- Hex color
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT 1,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
```

**Seed Data:**
| id | name | slug | description | icon | sort_order |
|----|------|------|-------------|------|------------|
| 1 | 3D Printing | 3d-printing | Perfect prints. Not the doormat kind. | Printer | 0 |
| 2 | Programming | programming | Code that actually works. Shocking, I know. | Code | 1 |
| 3 | Electronics | electronics | Circuits smart enough to keep up with me | Cpu | 2 |
| 4 | FPV Drones | fpv-drones | Flying machines with zero input lag at the sticks | Plane | 3 |
| 5 | Motorcycles | motorcycles | The antidote to the grind | Bike | 7 |
| 6 | AI Development | ai-development | Teaching algorithms to outthink the average person | Brain | 4 |
| 7 | CNC Machining | cnc-machining | Tolerances that make machinists jealous | Cog | 5 |
| 8 | Laser Engraving | laser-engraving | Carving precision into existence in high resolution | Sparkles | 6 |

#### `contents` (Articles)
```sql
CREATE TABLE contents (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,               -- Markdown content OR empty for embedded components
    content_type VARCHAR(7),    -- 'article', 'page', 'project'
    status VARCHAR(9),          -- 'draft', 'published'
    blocks JSON,                -- For block-based content (optional)
    extra_data JSON,
    featured_image_id INTEGER REFERENCES media(id),
    category_id INTEGER REFERENCES categories(id),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    published_at DATETIME
);
```

#### `homepage_content`
```sql
CREATE TABLE homepage_content (
    id UUID PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,  -- 'hero', 'interests'
    content JSON NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

**Seed Data:**

Key: `hero`
```json
{
  "headline": "I Just Kept Doing What I Loved",
  "tagline": "The universe took care of the rest.",
  "subtitle": "CAD Engineering • Klipper Development • Cutting-Edge 3D Printers"
}
```

Key: `interests`
```json
{
  "interests": [
    {"icon": "Printer", "title": "3D Printing", "description": "Perfect prints. Not the doormat kind."},
    {"icon": "Code", "title": "Programming", "description": "Code that actually works. Shocking, I know."},
    {"icon": "Cpu", "title": "Electronics", "description": "Circuits smart enough to keep up with me."},
    {"icon": "Zap", "title": "FPV Drones", "description": "Flying machines with zero input lag."},
    {"icon": "Brain", "title": "AI Development", "description": "Teaching algorithms to outthink the average person."},
    {"icon": "Wrench", "title": "CNC Machining", "description": "Tolerances that make machinists jealous."},
    {"icon": "Sparkles", "title": "Laser Engraving", "description": "Carving precision into existence, 0.4mm layers or better."},
    {"icon": "Bike", "title": "Motorcycles", "description": "The antidote to the grind."}
  ]
}
```

#### `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT 1,
    is_superuser BOOLEAN DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME
);
```

---

## API Endpoints

### Public Endpoints

#### GET `/api/v1/content`
List published articles with pagination.

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Article Title",
      "slug": "article-slug",
      "excerpt": "Short description...",
      "content_type": "article",
      "status": "published",
      "is_featured": false,
      "view_count": 7,
      "created_at": "2025-11-28T10:01:04.415279",
      "published_at": null,
      "category": {
        "id": 1,
        "name": "3D Printing",
        "slug": "3d-printing"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

#### GET `/api/v1/content/{slug}`
Get single article by slug.

#### GET `/api/v1/homepage/content`
List all homepage content sections.

#### GET `/api/v1/homepage/content/{key}`
Get specific homepage section (hero, interests).

### Admin Endpoints (require JWT)

#### POST `/api/v1/auth/login`
Login with email/password, returns JWT tokens.

#### GET/POST/PUT/DELETE `/api/v1/content/admin`
CRUD for articles.

#### GET/POST/PUT/DELETE `/api/v1/homepage/admin/content`
CRUD for homepage content.

#### GET/POST/PUT/DELETE `/api/v1/categories`
CRUD for categories.

---

## Frontend Components

### Pages

#### HomePage (`/`)
```tsx
<Layout>
  <HeroSection />      {/* Dynamic from /api/v1/homepage/content/hero */}
  <InterestsShowcase /> {/* Dynamic from /api/v1/homepage/content/interests */}
  <LatestArticles />   {/* Dynamic from /api/v1/content?per_page=3 */}
</Layout>
```

#### ArticlePage (`/article/:slug`)
- Fetches article from `/api/v1/content/{slug}`
- **IMPORTANT**: Supports embedded React components for special articles
- If slug matches `EMBEDDED_COMPONENTS` map, renders that component instead of markdown

```tsx
const EMBEDDED_COMPONENTS: Record<string, React.FC> = {
  'gcode-extrusion-rate-analysis': ExtrusionAnalysisChart,
};
```

#### ArticlesPage (`/articles`)
- Lists all articles with pagination
- Grid layout with cards

#### HomepageAdminPage (`/admin`)
- Protected route (requires auth)
- Tabs for: Hero, Interests, Articles management
- Inline markdown preview

### Key Components

#### HeroSection
- Fetches hero content from API
- Displays: headline, tagline, subtitle
- Badges: "Maker", "Engineer", "Innovator"
- Default fallback if API fails

#### InterestsShowcase
- Fetches interests from API
- Grid of cards with Lucide icons
- Icon mapping: Printer, Code, Cpu, Zap, Bike, Brain, Wrench, Sparkles

#### ExtrusionAnalysisChart
- Plotly.js interactive chart
- 509 data points (sampled from 25,940)
- Stats grid: Min/Avg/Max rate, Total time
- Print specs: 0.8mm nozzle, 0.4mm layer, TPU 80A
- Scroll to zoom, drag to pan, double-click to reset

---

## Chart Data

The extrusion analysis chart displays volumetric flow rate over time for a TPU print.

**Data structure** (`chartData.ts`):
```typescript
export const chartData = [
  { time: 0.3192, volumetric_rate: 31.26, linear_rate: 13.00, feedrate: 5760.0 },
  { time: 0.7273, volumetric_rate: 31.27, linear_rate: 13.00, feedrate: 5760.0 },
  // ... 509 total data points
  // Time range: 0.32s to 612.09s
  // Volumetric rate range: ~5 to 90 mm³/s
];
```

**Print Specifications:**
- Nozzle: 0.8 mm
- Layer Height: 0.4 mm
- Filament: 1.75 mm
- Material: TPU 80A
- Total Filament: 16.19 m
- Segments: 25,940
- Data Points: 509 (sampled)
- Movement Time: 10:12 (612s)

---

## Design System

### Colors (TailwindCSS)
```js
// tailwind.config.js
colors: {
  steel: {
    300: '#a8b8c8',
    400: '#8a9aaa',
    500: '#6b7a8a',
    600: '#4d5d6d',
    700: '#2d3e52',
    800: '#1f2937',
    900: '#1a2332',
  },
  copper: {
    200: '#f0d9c4',
    300: '#e6c9a8',
    400: '#D4A574',
    500: '#c4956a',
  },
}
```

### Theme
- Dark mode by default (`<html class="dark">`)
- Steel grays for backgrounds
- Copper accents for highlights
- Gradient hero: steel-900 → steel-800 → steel-900

---

## Deployment (Uberspace.de)

### Backend
```bash
# Location: ~/gm-tc/backend/
# Service: supervisord with gmtc-api

# Service config: ~/etc/services.d/gmtc-api.ini
[program:gmtc-api]
command=/home/gmtc/gm-tc/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
directory=/home/gmtc/gm-tc/backend
autostart=yes
autorestart=yes

# Web backend routing
uberspace web backend set /api --http --port 8000
```

### Frontend
```bash
# Build: npm run build
# Deploy to: /var/www/virtual/gmtc/html/

# .htaccess for SPA routing
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^.*$ /index.html [L]
```

### Database
- File: `~/gm-tc/backend/gmtc_crm.db`
- **IMPORTANT**: Config must point to `gmtc_crm.db`, NOT `gmtc.db`

---

## Key Files to Create

### Backend

1. **main.py** - Include routers:
```python
from app.api.content import router as content_router
from app.api.homepage import router as homepage_router
from app.api.auth import router as auth_router

app.include_router(content_router, prefix="/api/v1")
app.include_router(homepage_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
```

2. **app/core/config.py**:
```python
DATABASE_URL = "sqlite:///./gmtc_crm.db"  # Use gmtc_crm.db!
JWT_SECRET_KEY = "your-secret-key"
API_PREFIX = "/api/v1"
```

### Frontend

1. **services/api.ts**:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gm-tc.tech/api/v1';
```

2. **services/blog.ts** - Use `/content` NOT `/blog/posts`:
```typescript
// List articles
api.get<ContentAPIResponse>('/content', { params })

// Get by slug
api.get<BlogPost>(`/content/${slug}`)
```

3. **App.tsx routes**:
```tsx
<Route path="/" element={<HomePage />} />
<Route path="/articles" element={<ArticlesPage />} />
<Route path="/article/:slug" element={<ArticlePage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/admin" element={<ProtectedRoute><HomepageAdminPage /></ProtectedRoute>} />
```

---

## Sample Article

**Title:** G-Code Extrusion Rate Analysis: TPU Print Deep Dive
**Slug:** gcode-extrusion-rate-analysis
**Category:** 3D Printing (id: 1)
**Excerpt:** A detailed analysis of volumetric extrusion rates during a TPU 80A print job, examining flow characteristics across 25,940 extrusion segments.
**Content:** (Empty - uses embedded ExtrusionAnalysisChart component)

---

## Quick Start Commands

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic python-jose passlib bcrypt python-multipart
alembic upgrade head
python seed.py  # Create initial data
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm install react-plotly.js plotly.js @types/react-plotly.js
npm install lucide-react react-markdown
npm run dev
```

### Production Deploy
```bash
# Frontend
cd frontend && npm run build
rsync -avz dist/ gmtc@gmtc.uber.space:/var/www/virtual/gmtc/html/

# Backend
rsync -avz --exclude 'venv' --exclude '__pycache__' backend/ gmtc@gmtc.uber.space:~/gm-tc/backend/
ssh gmtc@gmtc.uber.space "cd ~/gm-tc/backend && source venv/bin/activate && pip install -r requirements.txt"
ssh gmtc@gmtc.uber.space "supervisorctl restart gmtc-api"
```

---

## Important Notes

1. **Database file**: Use `gmtc_crm.db`, not `gmtc.db`
2. **API endpoints**: Use `/content` for articles, NOT `/blog/posts`
3. **Embedded components**: ArticlePage checks slug against `EMBEDDED_COMPONENTS` map
4. **Icons**: Use Lucide React icons, mapped by name string
5. **SPA routing**: .htaccess required for client-side routing
6. **Auth**: JWT tokens stored in localStorage as `access_token`

---

## Files Reference

This guide documents the GM-TC portfolio CMS as it existed before corruption.
The chart data file contains 509 sampled data points from the original G-Code analysis.
All seed data for categories, homepage content, and the sample article are included above.
