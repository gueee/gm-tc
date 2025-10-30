#!/bin/bash
# Deploy GM-TC CRM to Uberspace
# Run this script after SSH-ing to gmtc.uber.space

set -e

echo "========================================="
echo "GM-TC CRM Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create directories
echo -e "${YELLOW}Step 1: Creating directories...${NC}"
mkdir -p ~/gmtc-crm ~/logs ~/backups
cd ~/gmtc-crm

# Step 2: Clone or pull repository
echo -e "${YELLOW}Step 2: Getting latest code...${NC}"
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    # If repository is private, you'll need to authenticate
    git clone https://github.com/gueee/gm-tc.git .
else
    echo "Updating existing repository..."
    git pull origin main
fi

# Step 3: Set up Python virtual environment
echo -e "${YELLOW}Step 3: Setting up Python environment...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Step 5: Create .env file
echo -e "${YELLOW}Step 5: Creating environment configuration...${NC}"
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=sqlite:///./gmtc_crm.db

# Application Settings
ENVIRONMENT=production
DEBUG=False
API_PORT=8000
API_HOST=127.0.0.1

# Security - CHANGE THESE!
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Settings
ALLOWED_ORIGINS=https://gm-tc.tech,https://www.gm-tc.tech,https://gmtc.uber.space

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=office@gm-tc.tech
SMTP_PASSWORD=
SMTP_FROM=office@gm-tc.tech
SMTP_FROM_NAME=GM-TC CRM

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads

# Pagination
DEFAULT_PAGE_SIZE=50
MAX_PAGE_SIZE=100
EOF

    # Generate random secrets
    SECRET=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s|SECRET_KEY=.*|SECRET_KEY=$SECRET|" .env
    sed -i "s|JWT_SECRET_KEY=.*|JWT_SECRET_KEY=$JWT_SECRET|" .env

    echo -e "${GREEN}✓ Created .env file with random secrets${NC}"
else
    echo ".env file already exists, skipping..."
fi

# Step 6: Run database migrations
echo -e "${YELLOW}Step 6: Running database migrations...${NC}"
alembic upgrade head

# Step 7: Set up supervisord service
echo -e "${YELLOW}Step 7: Setting up supervisord service...${NC}"
mkdir -p ~/etc/services.d
cat > ~/etc/services.d/gmtc-api.ini << 'EOF'
[program:gmtc-api]
directory=%(ENV_HOME)s/gmtc-crm/backend
command=%(ENV_HOME)s/gmtc-crm/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=30
stopwaitsecs=60
stdout_logfile=%(ENV_HOME)s/logs/gmtc-api.log
stderr_logfile=%(ENV_HOME)s/logs/gmtc-api-error.log
EOF

# Step 8: Configure web backend
echo -e "${YELLOW}Step 8: Configuring web backend...${NC}"
uberspace web backend set / --http --port 8000

# Step 9: Add domains
echo -e "${YELLOW}Step 9: Configuring domains...${NC}"
uberspace web domain add gm-tc.tech || echo "gm-tc.tech already added"
uberspace web domain add www.gm-tc.tech || echo "www.gm-tc.tech already added"

# Step 10: Restart services
echo -e "${YELLOW}Step 10: Starting services...${NC}"
supervisorctl reread
supervisorctl update
supervisorctl restart gmtc-api

# Step 11: Check status
echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Service status:"
supervisorctl status gmtc-api
echo ""
echo "Your API should now be available at:"
echo "  https://gm-tc.tech"
echo "  https://www.gm-tc.tech"
echo "  https://gmtc.uber.space"
echo ""
echo "Check logs with:"
echo "  tail -f ~/logs/gmtc-api.log"
echo "  tail -f ~/logs/gmtc-api-error.log"
echo ""
echo "Restart service with:"
echo "  supervisorctl restart gmtc-api"
echo ""
