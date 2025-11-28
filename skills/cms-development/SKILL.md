---
name: cms-development
description: CMS backend development for gm-tc.tech. Use when working on content management, admin interfaces, database schemas, API endpoints, authentication, or any server-side functionality. Covers PHP/Node.js backend patterns, database design, and API development.
---

# CMS Development

Backend patterns for the gm-tc.tech content management system.

## Architecture Overview

```
cms/
├── api/                  # API endpoints
│   ├── auth/            # Authentication routes
│   ├── content/         # Content CRUD
│   └── media/           # File uploads
├── admin/               # Admin interface
├── config/              # Configuration files
├── database/
│   ├── migrations/      # Schema migrations
│   └── seeds/           # Test data
├── lib/                 # Shared utilities
└── storage/             # Uploaded files (gitignored)
```

## Database Schema Patterns

Content table structure:

```sql
CREATE TABLE content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  content_type VARCHAR(50) DEFAULT 'page',
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  meta_description TEXT,
  featured_image VARCHAR(500),
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_type (content_type)
);
```

## API Design

RESTful endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/content | List content (with pagination) |
| GET | /api/content/:slug | Get single item |
| POST | /api/content | Create (auth required) |
| PUT | /api/content/:slug | Update (auth required) |
| DELETE | /api/content/:slug | Delete (auth required) |

Response format:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

Error format:

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Content not found" }
}
```

## Authentication

- Session-based for admin interface
- JWT tokens for API access
- Password hashing: bcrypt with cost factor 12
- Rate limiting on auth endpoints

## Security Checklist

- [ ] Input validation/sanitization on all endpoints
- [ ] Prepared statements for database queries
- [ ] CSRF protection on forms
- [ ] XSS prevention (escape output)
- [ ] Secure headers (CSP, X-Frame-Options, etc.)
- [ ] HTTPS only in production

## File Upload Handling

- Validate MIME types server-side
- Generate unique filenames (UUID)
- Store outside web root or with access control
- Image processing: resize, optimize on upload
