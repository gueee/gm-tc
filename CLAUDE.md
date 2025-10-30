# GM-TC CRM System - Development Guide

## Project Overview

**GM-TC CRM System** is a specialized Customer Relationship Management (CRM) system designed for managing a 3D printer manufacturing business. The project is in early-stage development and handles suppliers, customers, printer parts inventory, delivery notes, billing, and related business operations.

**Project Type**: Business Management Software / CRM System
**Status**: Initial development phase
**Repository**: https://github.com/gueee/gm-tc
**Primary Domain**: gm-tc.tech (hosted on uberspace.de)

## Core Architecture

### System Design

The application is structured around core business modules that manage different aspects of the 3D printer manufacturing and sales workflow:

```
GM-TC CRM System
├── Supplier Management Module
│   ├── Supplier database and profiles
│   ├── Contact information management
│   ├── Purchase order management
│   └── Performance tracking
│
├── Customer Management Module
│   ├── Customer database and profiles
│   ├── Communication history
│   ├── Order tracking
│   └── Customer history
│
├── Parts Inventory Management
│   ├── 3D printer component catalog
│   ├── Parts specifications
│   ├── Stock level tracking
│   └── Parts-to-build mapping
│
├── Printer Build Management
│   ├── Build configurations/recipes
│   ├── Parts requirements per build
│   └── Build status tracking
│
├── Delivery Management
│   ├── Delivery notes generation
│   ├── Shipping tracking
│   └── Delivery history
│
└── Billing & Invoicing
    ├── Invoice generation
    ├── Payment tracking
    └── Financial reporting
```

### Component Interaction

The system follows a modular design where each business domain operates as a distinct module with defined interfaces. Data flows through:

1. **Data Collection** (Suppliers, Customers, Parts) → 
2. **Order Processing** (Build management) → 
3. **Fulfillment** (Delivery management) → 
4. **Monetization** (Billing & Invoicing)

## Technology Stack

### Recommended Stack
- **Backend**: FastAPI (Python) - Fast development, automatic API docs, type safety
- **Frontend**: React + TypeScript with Shadcn/ui + TailwindCSS
- **Database**: PostgreSQL - Robust relational model for complex business relationships
- **ORM**: SQLAlchemy (Python) - Type-safe database operations
- **State Management**: TanStack Query (React Query) - Server state synchronization
- **Authentication**: JWT tokens with refresh mechanism
- **Hosting**: uberspace.de (SSH/FTP access via gmtc.uber.space)

See [STRATEGY.md](STRATEGY.md) for detailed rationale and alternatives.

## Directory Structure

```
/home/gueee78/Coding/gm-tc/
├── README.md                 # Project overview and features
├── CLAUDE.md                 # This file - development guide
└── .git/                     # Git repository
```

Currently, the repository contains only documentation. Source code directories will be added as development begins.

## Development Setup

### Prerequisites
- (To be determined based on technology stack)

### Installation
_Setup instructions will be added as the project develops_

### Environment Configuration
_Environment variable configuration will be documented as needed_

## Build, Test & Development Commands

### Backend (FastAPI)
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000

# Run database migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Lint and format
black .
ruff check .
```

### Frontend (React)
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

### Deployment

**Production Deployment**:
- Domain: gm-tc.tech
- Hosting: uberspace.de
- SSH/FTP Access: gmtc.uber.space

Deployment procedures will be documented as CI/CD pipeline is established.

## Key Architectural Patterns

### Planned Patterns

1. **Modular Architecture**: Each business domain (suppliers, customers, parts, etc.) operates as a distinct module with clear interfaces
2. **RESTful API Design** (likely): For consistent data access and frontend-backend communication
3. **Data Normalization**: Structured relational data model for business entities
4. **Status Tracking**: All major entities (orders, builds, deliveries) include status tracking
5. **Audit Trail**: Business-critical operations should maintain history for compliance

### Data Model Principles

- **Entities**: Suppliers, Customers, Parts, Builds, Deliveries, Invoices
- **Relationships**: Many-to-many between customers and builds, parts and builds
- **Temporal Data**: Order dates, delivery dates, payment dates tracked throughout lifecycle
- **Inventory Management**: Real-time stock level synchronization across modules

## Configuration Details

### Git Configuration
- **Main Branch**: main
- **Remote**: origin (github.com/gueee/gm-tc)
- **Initial Commit**: 3845bd2 - "Initial commit: Add README.md for GM-TC CRM project"

### Hosting Configuration
- **Provider**: uberspace.de
- **Domain**: gm-tc.tech
- **Access Methods**: SSH and FTP via gmtc.uber.space
- **Production URL**: https://gm-tc.tech

## Documentation Standards

All documentation will follow these conventions:
- Use Markdown format (.md files)
- Keep README.md as project overview
- Use CLAUDE.md for developer-focused information
- Document API endpoints in dedicated files as they're developed
- Maintain database schema documentation

## Naming Conventions

**Pending**: To be established based on:
- Code language/framework selection
- Database naming standards
- API endpoint naming patterns
- File organization patterns

## Database & Data Models

**Status**: Schema design pending

### Planned Core Entities
```
Suppliers
├── supplier_id (PK)
├── name
├── contact_info
└── performance_metrics

Customers
├── customer_id (PK)
├── name
├── contact_info
└── order_history

Parts
├── part_id (PK)
├── name
├── specifications
└── current_stock

Builds
├── build_id (PK)
├── name
├── configuration
├── required_parts[]
└── status

Deliveries
├── delivery_id (PK)
├── build_id (FK)
├── customer_id (FK)
├── delivery_date
└── tracking_info

Invoices
├── invoice_id (PK)
├── delivery_id (FK)
├── amount
└── payment_status
```

## API Structure (Planned)

Anticipated endpoint structure following RESTful conventions:

```
/api/v1/suppliers
  GET    /         - List suppliers
  POST   /         - Create supplier
  GET    /{id}     - Get supplier details
  PUT    /{id}     - Update supplier
  DELETE /{id}     - Delete supplier

/api/v1/customers
  [similar CRUD operations]

/api/v1/parts
  [similar CRUD operations]

/api/v1/builds
  [similar CRUD operations]
  POST   /{id}/start - Begin build
  PATCH  /{id}/status - Update build status

/api/v1/deliveries
  [similar CRUD operations]

/api/v1/invoices
  [similar CRUD operations]
```

## Development Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop** (to be created): Integration branch for features
- **feature/**: Individual feature branches (feature/supplier-management, etc.)

### Commit Message Convention
Follow conventional commits once development begins:
```
type(scope): subject

feat(suppliers): add supplier performance tracking
fix(billing): correct invoice calculation
docs(api): update endpoint documentation
```

## Security Considerations

### Planned Security Measures
- Input validation for all data entry points
- SQL injection prevention (parameterized queries/ORMs)
- Authentication and authorization for user roles
- HTTPS encryption for all connections to gm-tc.tech
- Secure credential management for database and API keys
- Audit logging for financial transactions

### Environment Secrets
- Database credentials
- API keys
- JWT secrets (if using token auth)
- Third-party service credentials

Use environment variables and never commit secrets to repository.

## Performance Considerations

### Optimization Targets
- Inventory queries: Optimize for real-time stock level checks
- Reporting: Consider caching for financial reports
- Search: Index supplier and customer records for fast lookup
- Batch operations: Support bulk import/export of parts and orders

## Testing Strategy

### Test Types (Planned)
- **Unit Tests**: Individual module functions
- **Integration Tests**: Module interactions (e.g., build → delivery → invoice workflow)
- **API Tests**: Endpoint behavior and error handling
- **Database Tests**: Schema integrity and constraints
- **End-to-End Tests**: Complete business workflows

## Known Issues & Future Enhancements

### Planned Features
- Multi-user support with role-based access control
- Real-time inventory synchronization
- Customer portal for order tracking
- Supplier communications integration
- Financial reporting and analytics
- Export functionality (invoices, delivery notes, reports)

### Performance Roadmap
1. Set up CI/CD pipeline
2. Implement comprehensive testing
3. Database performance optimization
4. API caching strategies
5. Frontend optimization

## Contributing

Contributing guidelines will be established as the project develops. Current maintainer: gueee

## License

License to be determined.

## Related Resources

- **Production Site**: https://gm-tc.tech
- **Repository**: https://github.com/gueee/gm-tc
- **Hosting**: uberspace.de documentation at https://manual.uberspace.de
- **SSH Access**: gmtc.uber.space

---

**Document Status**: Initial draft - to be updated as project evolves
**Last Updated**: October 30, 2025
**Maintainer**: Development team
