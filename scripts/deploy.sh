#!/bin/bash
# =============================================================================
# GM-TC Deployment Script for Uberspace
# =============================================================================
# This script runs ON the Uberspace server (gmtc.uber.space)
# It pulls the latest code from GitHub and builds/deploys both backend & frontend
#
# Usage:
#   ssh gmtc@gmtc.uber.space "~/bin/deploy-gm-tc.sh"
#   OR
#   ssh gmtc@gmtc.uber.space
#   ~/bin/deploy-gm-tc.sh
# =============================================================================

set -e  # Exit on any error

# Configuration
REPO_DIR="$HOME/repos/gm-tc"
WEB_ROOT="/var/www/virtual/gmtc/html"
BRANCH="main"

echo "============================================="
echo "  GM-TC Deployment - $(date)"
echo "============================================="

# Navigate to repo
cd "$REPO_DIR"

# Pull latest changes (force reset to handle any local changes)
echo ""
echo "[1/5] Pulling latest code from GitHub..."
git fetch origin

# Reset any local changes - ensures clean state
echo "      Resetting to origin/$BRANCH (discarding local changes)..."
git checkout $BRANCH
git reset --hard origin/$BRANCH
git clean -fd

# Backend deployment
echo ""
echo "[2/5] Updating backend..."
cd "$REPO_DIR/backend"
source venv/bin/activate

echo "      Installing Python dependencies..."
pip install -q -r requirements.txt

echo "      Running database migrations..."
alembic upgrade head

# Frontend - skip build on server (not enough memory)
# Build locally and upload via: scp -r frontend/dist/* gmtc@gmtc.uber.space:/var/www/virtual/gmtc/html/
echo ""
echo "[3/5] Frontend deployment..."
echo "      NOTE: Build locally and upload dist folder manually (server has insufficient memory)"
echo "      Run: cd frontend && npm run build && scp -r dist/* gmtc@gmtc.uber.space:/var/www/virtual/gmtc/html/"
echo ""

# Check if dist was uploaded
if [ -d "$WEB_ROOT/assets" ]; then
    echo "      Frontend assets found in web root - OK"
else
    echo "      WARNING: No frontend assets found! Upload dist folder manually."
fi

# Create .htaccess for SPA routing
echo ""
echo "[5/5] Configuring Apache..."
cat > "$WEB_ROOT/.htaccess" << 'EOF'
RewriteEngine On
RewriteBase /

# Don't rewrite files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Rewrite everything else to index.html for SPA routing
RewriteRule ^.*$ /index.html [L]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Don't cache HTML
<FilesMatch "\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>
EOF

# Restart API service
echo ""
echo "Restarting API service..."
supervisorctl restart gmtc-api

echo ""
echo "============================================="
echo "  Deployment Complete!"
echo "============================================="
echo ""
echo "Site: https://gm-tc.tech"
echo "API:  https://gm-tc.tech/api/v1"
echo ""




