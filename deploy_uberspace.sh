#!/bin/bash
# Complete deployment script for Uberspace
# Run this on the Uberspace server after SSH connection

set -e

echo "========================================="
echo "GM-TC Deployment to Uberspace"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Update code
echo -e "${YELLOW}[1/7] Updating code from repository...${NC}"
cd ~/gm-tc || (cd ~ && git clone https://github.com/gueee/gm-tc.git && cd gm-tc)
git pull origin main || echo "Already up to date or first time setup"

# Step 2: Backend setup
echo -e "${YELLOW}[2/7] Setting up backend...${NC}"
cd ~/gm-tc/backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

# Step 3: Environment configuration
echo -e "${YELLOW}[3/7] Configuring environment...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
DATABASE_URL=sqlite:///./gmtc_crm.db
ENVIRONMENT=production
DEBUG=False
API_PORT=8000
API_HOST=127.0.0.1
SECRET_KEY=PLACEHOLDER_SECRET_KEY
JWT_SECRET_KEY=PLACEHOLDER_JWT_SECRET_KEY
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=https://gm-tc.tech,https://www.gm-tc.tech,https://gmtc.uber.space
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=office@gm-tc.tech
SMTP_PASSWORD=
SMTP_FROM=office@gm-tc.tech
SMTP_FROM_NAME=GM-TC CRM
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
DEFAULT_PAGE_SIZE=50
MAX_PAGE_SIZE=100
EOF
    # Generate secure keys
    SECRET=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/PLACEHOLDER_SECRET_KEY/$SECRET/" .env
    sed -i "s/PLACEHOLDER_JWT_SECRET_KEY/$JWT_SECRET/" .env
    echo -e "${GREEN}✓ Created .env file with secure keys${NC}"
else
    echo "✓ .env file already exists"
fi

# Step 4: Database migrations
echo -e "${YELLOW}[4/7] Running database migrations...${NC}"
alembic upgrade head
echo -e "${GREEN}✓ Database migrations complete${NC}"

# Step 5: Frontend build
echo -e "${YELLOW}[5/7] Building frontend...${NC}"
cd ~/gm-tc/frontend
npm install --silent
npm run build
echo -e "${GREEN}✓ Frontend build complete${NC}"

# Step 6: Deploy frontend
echo -e "${YELLOW}[6/7] Deploying frontend files...${NC}"
mkdir -p ~/html
cp -r dist/* ~/html/
# Ensure .htaccess is copied for SPA routing
if [ -f "dist/.htaccess" ]; then
    cp dist/.htaccess ~/html/.htaccess
fi
chmod -R 755 ~/html
chmod 644 ~/html/.htaccess 2>/dev/null || true
echo -e "${GREEN}✓ Frontend deployed to ~/html${NC}"

# Step 7: Service management
echo -e "${YELLOW}[7/7] Managing services...${NC}"
mkdir -p ~/etc/services.d
mkdir -p ~/logs

# Create/update service file with absolute paths
HOME_DIR=$(echo $HOME)
cat > ~/etc/services.d/gmtc-api.ini << EOF
[program:gmtc-api]
directory=$HOME_DIR/gm-tc/backend
command=$HOME_DIR/gm-tc/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=10
stopwaitsecs=30
stdout_logfile=$HOME_DIR/logs/gmtc-api.log
stderr_logfile=$HOME_DIR/logs/gmtc-api-error.log
environment=PATH="$HOME_DIR/gm-tc/backend/venv/bin:\$PATH"
EOF

# Configure web backends
uberspace web backend set /api --http --port 8000 || echo "Backend already configured"
uberspace web backend set / --apache || echo "Apache backend already configured"

# Add domains
uberspace web domain add gm-tc.tech 2>/dev/null || echo "Domain gm-tc.tech already exists"
uberspace web domain add www.gm-tc.tech 2>/dev/null || echo "Domain www.gm-tc.tech already exists"

# Restart service
supervisorctl reread
supervisorctl update
supervisorctl restart gmtc-api || supervisorctl start gmtc-api

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Service status:"
supervisorctl status gmtc-api
echo ""
echo "Your application is available at:"
echo "  🌐 Homepage: https://gm-tc.tech"
echo "  📝 Blog: https://gm-tc.tech/blog"
echo "  🔧 API: https://gm-tc.tech/api/v1/health"
echo ""
echo "View logs with:"
echo "  tail -f ~/logs/gmtc-api.log"
echo ""
echo "Restart service with:"
echo "  supervisorctl restart gmtc-api"
echo ""

