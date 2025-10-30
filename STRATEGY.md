# GM-TC CRM Development Strategy

## Executive Summary

This document outlines a pragmatic, phased approach to building the GM-TC CRM system - a specialized platform for managing 3D printer manufacturing operations. The strategy prioritizes rapid value delivery, minimizes technical complexity, and ensures scalability.

## 1. Recommended Technology Stack

### Backend
- **Framework**: FastAPI (Python) or Express.js (Node.js)
  - **Rationale**: Fast development, excellent API support, minimal boilerplate
  - **Recommendation**: FastAPI for type safety and automatic API documentation
- **Database**: PostgreSQL
  - Robust relational model for complex business relationships
  - Excellent JSONB support for flexible data
- **ORM**: SQLAlchemy (Python) or Prisma (Node.js)
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: Local filesystem initially, S3-compatible later

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Shadcn/ui + TailwindCSS
  - Modern, accessible components
  - Fast development without heavy framework overhead
- **State Management**: TanStack Query (React Query)
  - Server state synchronization
  - Optimistic updates and caching
- **Form Handling**: React Hook Form + Zod validation
- **Build Tool**: Vite

### Deployment & Infrastructure
- **Hosting**: uberspace.de (existing)
- **Web Server**: Nginx reverse proxy
- **Process Manager**: systemd or PM2
- **Database Backup**: pg_dump automated daily
- **CI/CD**: GitHub Actions (simple)

### Development Tools
- **API Testing**: Postman/Bruno or built-in FastAPI docs
- **Database Migrations**: Alembic (Python) or Prisma Migrate
- **Code Quality**: ESLint, Prettier, Black (Python)
- **Version Control**: Git with conventional commits

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Suppliers │  │Customers │  │  Parts   │  │ Builds   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Delivery │  │ Billing  │  │ Reports  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                    RESTful API (JSON)
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (FastAPI)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes & Controllers                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Business Logic & Services Layer             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Data Access Layer (ORM)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  - Suppliers    - Customers    - Parts                      │
│  - Builds       - Deliveries   - Invoices                   │
│  - Purchase Orders  - Inventory Transactions                │
└─────────────────────────────────────────────────────────────┘
```

## 3. Phased Implementation Roadmap

### Phase 0: Foundation (Week 1-2)
**Goal**: Set up development environment and core infrastructure

**Tasks**:
- Initialize repository structure
- Set up development environment (Python/Node + PostgreSQL)
- Configure tooling (linting, formatting, pre-commit hooks)
- Design and implement database schema
- Set up basic authentication system
- Create initial API scaffold
- Deploy basic "hello world" to uberspace.de

**Deliverables**:
- Working dev environment
- Database schema with migrations
- Basic user authentication
- Deployed skeleton app

### Phase 1: Core Entities (Week 3-5)
**Goal**: Implement foundational data management

**Priority 1 - Parts Management**:
- Parts CRUD operations
- Parts catalog browsing
- Stock level tracking
- Basic search and filtering

**Priority 2 - Supplier Management**:
- Supplier CRUD operations
- Contact information management
- Supplier listing and search

**Priority 3 - Customer Management**:
- Customer CRUD operations
- Customer profiles
- Contact history tracking

**Deliverables**:
- Functional parts, supplier, and customer modules
- Basic UI for data entry and viewing
- Search and filter capabilities

### Phase 2: Order & Build Management (Week 6-8)
**Goal**: Connect entities to enable workflow

**Purchase Orders**:
- Create PO from suppliers
- Link parts to purchase orders
- PO status tracking
- Receiving/inventory updates

**Printer Builds**:
- Build configuration management
- Bill of Materials (BOM) system
- Parts allocation to builds
- Build status workflow

**Customer Orders**:
- Customer order creation
- Link orders to builds
- Order status tracking

**Deliverables**:
- Complete order-to-build workflow
- Inventory management integration
- BOM system

### Phase 3: Operations & Fulfillment (Week 9-10)
**Goal**: Handle delivery and logistics

**Delivery Management**:
- Delivery note generation (PDF)
- Shipping label printing
- Delivery tracking
- Delivery history

**Inventory Automation**:
- Auto-update stock on delivery
- Low stock alerts
- Stock reservation system

**Deliverables**:
- Delivery note generation
- Automated inventory updates
- Alert system

### Phase 4: Financial Management (Week 11-12)
**Goal**: Complete billing and reporting

**Invoicing**:
- Invoice generation from orders
- PDF invoice creation
- Payment tracking
- Payment status workflow

**Reporting**:
- Sales reports
- Inventory reports
- Supplier performance
- Customer insights
- Financial dashboards

**Deliverables**:
- Complete invoicing system
- Financial reporting suite
- Dashboard analytics

### Phase 5: Polish & Optimization (Week 13-14)
**Goal**: Production readiness

**Enhancements**:
- Email notifications
- PDF generation improvements
- Bulk operations
- Advanced search
- Data export (CSV/Excel)
- Audit logging
- Performance optimization

**Security & Compliance**:
- Security audit
- Data backup verification
- User permission system
- GDPR compliance (if applicable)

**Documentation**:
- User manual
- API documentation
- Deployment guide

**Deliverables**:
- Production-ready system
- Complete documentation
- Security hardening

## 4. Database Schema Strategy

### Core Principles
- Normalized relational design
- Foreign key constraints for data integrity
- Soft deletes (deleted_at timestamp)
- Audit fields (created_at, updated_at, created_by, updated_by)
- Use UUIDs for primary keys (better for distributed systems)

### Key Tables

```
suppliers
├── id (PK)
├── name
├── contact_info (JSONB)
├── rating
├── notes
└── audit fields

customers
├── id (PK)
├── name
├── contact_info (JSONB)
├── billing_address
├── shipping_address
└── audit fields

parts
├── id (PK)
├── sku
├── name
├── description
├── category
├── specifications (JSONB)
├── current_stock
├── minimum_stock
├── unit_price
└── audit fields

suppliers_parts (junction)
├── supplier_id (FK)
├── part_id (FK)
├── supplier_sku
├── lead_time_days
└── unit_price

purchase_orders
├── id (PK)
├── supplier_id (FK)
├── po_number
├── order_date
├── expected_delivery_date
├── status (enum: draft, sent, received, cancelled)
├── total_amount
└── audit fields

purchase_order_items
├── id (PK)
├── purchase_order_id (FK)
├── part_id (FK)
├── quantity
├── unit_price
└── received_quantity

printer_builds
├── id (PK)
├── build_name
├── model_number
├── description
├── specifications (JSONB)
├── base_price
└── audit fields

build_parts (BOM)
├── id (PK)
├── build_id (FK)
├── part_id (FK)
├── quantity_required
└── notes

customer_orders
├── id (PK)
├── customer_id (FK)
├── order_number
├── order_date
├── expected_delivery_date
├── status (enum: pending, production, ready, shipped, delivered)
├── total_amount
└── audit fields

order_items
├── id (PK)
├── order_id (FK)
├── build_id (FK)
├── quantity
├── unit_price
└── customizations (JSONB)

deliveries
├── id (PK)
├── order_id (FK)
├── delivery_number
├── delivery_date
├── tracking_number
├── carrier
├── status (enum: pending, in_transit, delivered)
└── audit fields

invoices
├── id (PK)
├── order_id (FK)
├── invoice_number
├── invoice_date
├── due_date
├── subtotal
├── tax_amount
├── total_amount
├── status (enum: draft, sent, paid, overdue, cancelled)
├── payment_date
└── audit fields

inventory_transactions
├── id (PK)
├── part_id (FK)
├── transaction_type (enum: purchase, sale, adjustment, reservation)
├── quantity (signed int)
├── reference_type (enum: purchase_order, order, adjustment)
├── reference_id
├── transaction_date
└── audit fields
```

## 5. Development Workflow

### Git Strategy
- **Main branch**: Production-ready code
- **Develop branch**: Integration branch
- **Feature branches**: `feature/module-name`
- **Bugfix branches**: `bugfix/issue-description`

### Commit Convention
```
feat: Add supplier management API
fix: Correct inventory calculation bug
docs: Update API documentation
refactor: Optimize database queries
test: Add unit tests for parts module
```

### Code Review Process
- All changes via Pull Requests
- Self-review checklist before PR
- Test coverage required
- No direct commits to main

### Testing Strategy
- **Unit Tests**: Business logic and utilities
- **Integration Tests**: API endpoints
- **E2E Tests**: Critical user flows (optional, Phase 5)
- Target: 70%+ coverage for backend

## 6. API Design Principles

### RESTful Conventions
```
GET    /api/parts              # List all parts
GET    /api/parts/{id}         # Get specific part
POST   /api/parts              # Create new part
PUT    /api/parts/{id}         # Update part (full)
PATCH  /api/parts/{id}         # Update part (partial)
DELETE /api/parts/{id}         # Delete part (soft delete)
```

### Nested Resources
```
GET /api/builds/{id}/parts     # Get BOM for build
GET /api/orders/{id}/items     # Get order items
```

### Query Parameters
```
GET /api/parts?category=electronics&stock_min=10&sort=name&page=2
```

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-30T12:00:00Z",
    "request_id": "uuid"
  },
  "errors": null
}
```

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 250,
    "total_pages": 5
  }
}
```

## 7. Security Considerations

### Authentication & Authorization
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- Role-based access control (admin, manager, viewer)
- Secure password hashing (bcrypt)

### API Security
- Rate limiting (100 requests/minute)
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (ORM parameterization)
- XSS prevention

### Data Protection
- HTTPS only (enforce redirect)
- Environment variables for secrets
- Database connection encryption
- Regular backups with encryption
- Audit logging for sensitive operations

## 8. Performance Optimization

### Database
- Indexes on foreign keys and frequently queried fields
- Pagination for large datasets
- Connection pooling
- Query optimization (N+1 prevention)

### API
- Response caching (Redis in future)
- Compression (gzip)
- CDN for static assets
- Lazy loading for related data

### Frontend
- Code splitting
- Image optimization
- Debounced search inputs
- Optimistic UI updates

## 9. Deployment Strategy

### Uberspace.de Setup
```bash
# 1. SSH to server
ssh gmtc@gmtc.uber.space

# 2. Set up PostgreSQL database
createdb gmtc_crm

# 3. Clone repository
git clone https://github.com/gueee/gm-tc.git

# 4. Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run migrations
alembic upgrade head

# 7. Configure systemd service
# Create service file for API

# 8. Configure Nginx reverse proxy
# Point domain to application

# 9. Set up SSL (Let's Encrypt)
uberspace web backend set / --http --port 8000
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost/gmtc_crm
SECRET_KEY=<random-secret>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://gm-tc.tech
```

### Continuous Deployment
- Push to main triggers deployment
- GitHub Actions runs tests
- If tests pass, SSH to server and pull changes
- Restart service
- Run migrations if needed

## 10. Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Database corruption | High | Daily backups, point-in-time recovery |
| Server downtime | Medium | Monitoring, quick rollback procedure |
| Data breach | High | Security audit, encryption, access control |
| Performance degradation | Medium | Monitoring, query optimization, caching |
| Scope creep | Medium | Strict phase boundaries, MVP focus |

### Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Changing requirements | Medium | Modular architecture, flexible schema |
| User adoption | Medium | User testing, iterative feedback |
| Data migration issues | High | Validation scripts, staged rollout |

## 11. Success Metrics

### Phase 1-2 (Core Functionality)
- All CRUD operations functional
- <500ms average API response time
- Zero critical bugs
- Database schema validated

### Phase 3-4 (Operations)
- Complete order-to-delivery workflow
- PDF generation working
- Automated inventory updates
- Invoice generation functional

### Phase 5 (Production)
- 99% uptime
- All security checks passed
- User acceptance testing complete
- Documentation complete

## 12. Next Steps

### Immediate Actions (Next 48 Hours)
1. **Decide on tech stack**: Confirm FastAPI vs Express.js
2. **Set up repository structure**: Initialize project skeleton
3. **Database design**: Finalize schema and create migration
4. **Development environment**: Docker Compose for local dev
5. **Create initial tickets**: Break Phase 0 into actionable tasks

### Decision Points
- [ ] Backend framework choice (FastAPI recommended)
- [ ] Frontend UI library (Shadcn/ui recommended)
- [ ] Authentication method (JWT recommended)
- [ ] Deployment automation level (basic initially)

### Questions to Resolve
1. How many users will access the system? (affects auth complexity)
2. PDF template requirements? (invoice/delivery note design)
3. Email service needed? (transactional emails)
4. Multi-currency support? (affects billing module)
5. Multi-warehouse inventory? (affects parts module)

## Conclusion

This strategy provides a clear, phased roadmap to build the GM-TC CRM from zero to production in approximately 14 weeks. The approach prioritizes:

- **Rapid value delivery**: Core functionality in Phase 1-2
- **Minimal complexity**: Proven technologies, simple architecture
- **Scalability**: Modular design allows future enhancements
- **Risk management**: Phased approach with clear milestones

The recommended stack (FastAPI + React + PostgreSQL) offers excellent developer experience, strong typing, automatic API documentation, and production-ready performance suitable for a business-critical CRM system.


### Branding

we have a brand named FOUZIES 

https://fouzies.com/
logo and colors are essential.
