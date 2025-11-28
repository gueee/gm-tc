# GM-TC Portfolio CMS

Personal portfolio website for [gm-tc.tech](https://gm-tc.tech).

## Status: Ready for Rebuild

This repository has been cleaned and prepared for a fresh CMS implementation.

## What's Here

```
gm-tc/
├── Assets/                    # Data for rebuild
│   ├── chartData_backup.ts    # 509 Plotly chart data points
│   ├── seed_data.py           # Database seed script
│   ├── extrusion_data.csv     # Full G-Code analysis (25,940 segments)
│   └── extrusion_data_sampled.js
├── BUILD_GUIDE.md             # Complete rebuild documentation
├── skills/                    # Development guidelines
│   ├── cms-development/
│   ├── cursor-project/
│   ├── debugging/
│   ├── git-workflow/
│   ├── mcp-setup/
│   ├── seo-optimization/
│   ├── uberspace-deployment/
│   └── web-design/
└── .cursorrules               # Cursor AI rules
```

## Rebuild Guide

See [BUILD_GUIDE.md](BUILD_GUIDE.md) for complete documentation including:

- Database schema (SQLite)
- API endpoints (FastAPI)
- Frontend components (React + Vite + TailwindCSS)
- Seed data (categories, homepage content, sample article)
- Deployment instructions (Uberspace)

## Target Stack

- **Backend**: FastAPI + SQLite + SQLAlchemy
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Charts**: Plotly.js (react-plotly.js)
- **Icons**: Lucide React
- **Hosting**: Uberspace.de

## Contact

- **Website**: [gm-tc.tech](https://gm-tc.tech)
- **Email**: office@gm-tc.tech
