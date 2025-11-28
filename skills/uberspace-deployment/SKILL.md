---
name: uberspace-deployment
description: Uberspace hosting deployment for gm-tc.tech. Use when configuring the server, setting up domains, deploying code, managing services, or troubleshooting hosting issues. Covers Uberspace-specific commands, web backend setup, and deployment automation.
---

# Uberspace Deployment

Deployment configuration for gm-tc.tech on Uberspace (U7).

## Server Access

```bash
ssh gmtc@gmtc.uber.space
```

## Directory Structure

```
/home/gmtc/
├── html/                    # Symlink to web root (don't use directly)
├── var/www/virtual/gmtc/
│   └── html/               # Actual web root - deploy here
├── repos/
│   └── gm-tc/              # Git clone for deployments
└── bin/                    # Custom scripts
```

## Initial Server Setup

### 1. Clone Repository

```bash
mkdir -p ~/repos
cd ~/repos
git clone git@github.com:gmtc/gm-tc.git
```

### 2. Link to Web Root

```bash
# Remove default html content
rm -rf ~/html/*

# Option A: Symlink entire repo (if repo root = web root)
ln -s ~/repos/gm-tc/* ~/html/

# Option B: Symlink specific folder (if web files in subfolder)
ln -s ~/repos/gm-tc/public/* ~/html/
```

### 3. Configure Web Backend (if needed)

```bash
# Check current backend
uberspace web backend list

# For static sites, default Apache is fine
# For PHP
uberspace web backend set / --http --port 9000

# For Node.js app
uberspace web backend set / --http --port 3000
```

## Deployment Process

### Manual Pull

```bash
ssh gmtc@gmtc.uber.space
cd ~/repos/gm-tc
git pull origin main
```

### Deploy Script

Create `~/bin/deploy-gm-tc.sh`:

```bash
#!/bin/bash
set -e

REPO_DIR="$HOME/repos/gm-tc"
BRANCH="main"

echo "=== Deploying gm-tc.tech ==="

cd "$REPO_DIR"

echo "Fetching latest..."
git fetch origin

echo "Pulling $BRANCH..."
git checkout $BRANCH
git pull origin $BRANCH

# If using npm/composer:
# echo "Installing dependencies..."
# npm install --production
# composer install --no-dev

echo "=== Deployment complete ==="
```

Make executable:
```bash
chmod +x ~/bin/deploy-gm-tc.sh
```

Run deployment:
```bash
~/bin/deploy-gm-tc.sh
```

## Domain Configuration

```bash
# Add domain
uberspace web domain add gm-tc.tech
uberspace web domain add www.gm-tc.tech

# List domains
uberspace web domain list

# HTTPS is automatic via Let's Encrypt
```

## PHP Configuration (if applicable)

```bash
# Check PHP version
uberspace tools version show php

# Set PHP version
uberspace tools version use php 8.2

# PHP.ini overrides in ~/etc/php.d/
```

## Node.js Services (if applicable)

```bash
# Install Node.js version
uberspace tools version use node 20

# Create supervisord service for Node app
# ~/etc/services.d/gm-tc.ini:
[program:gm-tc]
command=node /home/gmtc/repos/gm-tc/server.js
autostart=yes
autorestart=yes

# Control service
supervisorctl reread
supervisorctl update
supervisorctl status gm-tc
supervisorctl restart gm-tc
```

## Troubleshooting

```bash
# Check Apache error log
tail -f ~/logs/error_log_apache

# Check access log
tail -f ~/logs/access_log

# Test web backend
curl -I https://gm-tc.tech

# Disk usage
quota -s
```

## Uberspace Manual Reference

Full documentation: https://manual.uberspace.de/
