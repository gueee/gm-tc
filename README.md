# GM-TC CRM System

A specialized Customer Relationship Management (CRM) system for managing a 3D printer manufacturing business. This CRM handles suppliers, customers, printer parts inventory, delivery notes, billing, and related business operations.

## Overview

This CRM system is designed to streamline operations for GM-TC, a business specializing in custom 3D printer manufacturing. It provides comprehensive management tools for all aspects of the business workflow.

## Features

### Core Modules

- **Supplier Management**
  - Supplier database and contact information
  - Supplier performance tracking
  - Purchase order management

- **Customer Management**
  - Customer database and profiles
  - Customer communication history
  - Order tracking and history

- **Parts Management**
  - Inventory of 3D printer components
  - Parts catalog and specifications
  - Stock level tracking
  - Parts-to-build mapping

- **Printer Build Management**
  - Build configurations and recipes
  - Parts requirements per build
  - Build status tracking

- **Delivery Management**
  - Delivery notes generation
  - Shipping tracking
  - Delivery history

- **Billing & Invoicing**
  - Invoice generation
  - Payment tracking
  - Financial reporting

## Deployment

### Domain
- **Production Domain**: [gm-tc.tech](https://gm-tc.tech)
- **Hosting**: uberspace.de
- **Access**: gmtc.uber.space (SSH, FTP, etc.)

### Server Details
- Hosting provider: uberspace.de
- SSH/FTP access via: gmtc.uber.space

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Production database (SQLite for development)
- **Alembic** - Database migrations
- **JWT** - Authentication
- **Pydantic** - Data validation

### Frontend (Coming Soon)
- **React + TypeScript** - UI framework
- **Shadcn/ui + TailwindCSS** - UI components
- **TanStack Query** - State management
- **Vite** - Build tool

### Deployment
- **Uberspace.de** - Hosting provider
- **Nginx** - Reverse proxy
- **Supervisord** - Process management

## Development Setup

### Quick Start

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Visit http://localhost:8000/docs for API documentation
```

### Detailed Setup

See [backend/README.md](backend/README.md) for complete backend setup instructions.

## Project Documentation

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current status and progress
- **[STRATEGY.md](STRATEGY.md)** - 14-week implementation plan
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Server deployment guide
- **[CLAUDE.md](CLAUDE.md)** - Development guide for AI assistants

## Current Status

✅ **Phase 0 Complete** (90%):
- Backend API framework
- Authentication system
- Database migrations
- Development environment

⏳ **Next Steps**:
- Frontend setup
- Parts management module
- Supplier management module

## License

_To be determined_

## Contact

- **Email**: office@gm-tc.tech
- **Repository**: https://github.com/gueee/gm-tc
- **Domain**: https://gm-tc.tech

