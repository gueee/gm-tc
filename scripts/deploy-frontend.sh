#!/bin/bash
# GM-TC Frontend Deployment Script for Uberspace
# Run this after deploy-uberspace.sh (backend)

set -e

APP_DIR="$HOME/gm-tc"
FRONTEND_DIR="$APP_DIR/frontend"
HTML_DIR="$HOME/html"
NODE_VERSION="20"

echo "=== GM-TC Frontend Deployment ==="
echo ""

# 1. Check Node.js version
echo "Setting up Node.js..."
source "$HOME/.nvm/nvm.sh" 2>/dev/null || {
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    source "$HOME/.bashrc"
    source "$HOME/.nvm/nvm.sh"
}

nvm install $NODE_VERSION
nvm use $NODE_VERSION

echo "Using Node: $(node --version)"

# 2. Build frontend
echo ""
echo "Building frontend..."
cd "$FRONTEND_DIR"

npm install
npm run build

# 3. Deploy to html directory
echo ""
echo "Deploying to web root..."

# Backup existing html content
if [ -d "$HTML_DIR" ] && [ "$(ls -A $HTML_DIR)" ]; then
    BACKUP_DIR="$HOME/html_backup_$(date +%Y%m%d_%H%M%S)"
    mv "$HTML_DIR" "$BACKUP_DIR"
    echo "Backed up existing html to: $BACKUP_DIR"
fi

mkdir -p "$HTML_DIR"

# Copy build output
cp -r "$FRONTEND_DIR/dist/"* "$HTML_DIR/"

# 4. Configure .htaccess for SPA routing
cat > "$HTML_DIR/.htaccess" << 'EOF'
# Serve index.html for SPA routes
RewriteEngine On
RewriteBase /

# Don't rewrite files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Don't rewrite API calls
RewriteCond %{REQUEST_URI} !^/api

# Rewrite everything else to index.html
RewriteRule ^(.*)$ /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
    ExpiresByType application/font-woff2 "access plus 1 month"
</IfModule>
EOF

echo ""
echo "=== Frontend Deployment Complete ==="
echo ""
echo "Site available at: https://gm-tc.tech"
echo ""
echo "The API is proxied via web backend:"
echo "  - Frontend: https://gm-tc.tech/"
echo "  - Backend API: https://gm-tc.tech/api/"
