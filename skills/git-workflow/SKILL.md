---
name: git-workflow
description: Git version control and deployment workflow for gm-tc.tech. Use when committing changes, managing branches, resolving conflicts, pushing to remote, or deploying via git pull on Uberspace. Covers branching strategy, commit conventions, and deployment procedures.
---

# Git Workflow

Version control and deployment workflow for gm-tc.tech.

## Repository Setup

### Initial Setup (Local)

```bash
# If repo exists locally, ensure remote is configured
git remote -v

# Add/update remote if needed
git remote add origin git@github.com:<username>/gm-tc.git
# or
git remote set-url origin git@github.com:<username>/gm-tc.git
```

### SSH Key Setup (for Uberspace)

```bash
# On Uberspace, generate key if not exists
ssh-keygen -t ed25519 -C "uberspace-gm-tc"

# Add public key to GitHub as deploy key (read-only is sufficient for pulls)
cat ~/.ssh/id_ed25519.pub
```

## Branching Strategy

Simple two-branch model:

- `main` - Production-ready code, deploys to live site
- `dev` - Development/staging branch

```bash
# Create dev branch if not exists
git checkout -b dev
git push -u origin dev

# Feature work
git checkout dev
# ... make changes ...
git add .
git commit -m "feat: description"
git push

# Deploy to production
git checkout main
git merge dev
git push
# Then pull on Uberspace
```

## Commit Message Convention

Format: `<type>: <description>`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `style` - CSS/visual changes
- `content` - Content updates
- `refactor` - Code restructuring
- `docs` - Documentation
- `chore` - Maintenance tasks

Examples:
```
feat: add contact form to homepage
fix: resolve mobile navigation overlap
style: update color scheme for dark mode
content: add new blog post about X
```

## Standard Workflow

### Making Changes

```bash
# 1. Ensure you're on dev and up to date
git checkout dev
git pull origin dev

# 2. Make your changes
# ... edit files ...

# 3. Stage and commit
git add .
git status  # Review changes
git commit -m "type: description"

# 4. Push to remote
git push origin dev
```

### Deploying to Production

```bash
# Local: merge dev into main
git checkout main
git pull origin main
git merge dev
git push origin main

# On Uberspace: pull changes (see uberspace-deployment skill)
```

## Useful Commands

```bash
# View status
git status

# View commit history
git log --oneline -10

# Discard local changes
git checkout -- <file>

# Stash changes temporarily
git stash
git stash pop

# View diff before committing
git diff
git diff --staged
```

## .gitignore Essentials

```gitignore
# Dependencies
node_modules/
vendor/

# Environment
.env
.env.local
*.local

# Uploads/storage
storage/
uploads/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Build artifacts
dist/
build/
```
