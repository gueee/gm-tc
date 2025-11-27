# Deploy GM-TC to Uberspace

## Quick Deployment Guide

### Step 1: Connect to Uberspace

```bash
ssh gmtc@gmtc.uber.space
# Password: US_reJect78
```

### Step 2: Initial Setup (First Time Only)

Run these commands on the server:

```bash
# Create necessary directories
mkdir -p ~/logs ~/backups ~/html

# Clone repository (if not already cloned)
cd ~
git clone https://github.com/gueee/gm-tc.git
cd gm-tc

# Set up Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./gmtc_crm.db
ENVIRONMENT=production
DEBUG=False
API_PORT=8000
API_HOST=127.0.0.1
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
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

# Generate secure random keys
SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s|\$(openssl rand -hex 32)|$SECRET|" .env
sed -i "s|\$(openssl rand -hex 32)|$JWT_SECRET|" .env

# Run database migrations (includes blog_posts table)
alembic upgrade head

# Set up supervisord service
mkdir -p ~/etc/services.d
cat > ~/etc/services.d/gmtc-api.ini << 'SERVICEEOF'
[program:gmtc-api]
directory=%(ENV_HOME)s/gm-tc/backend
command=%(ENV_HOME)s/gm-tc/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=30
stopwaitsecs=60
stdout_logfile=%(ENV_HOME)s/logs/gmtc-api.log
stderr_logfile=%(ENV_HOME)s/logs/gmtc-api-error.log
environment=PATH="%(ENV_HOME)s/gm-tc/backend/venv/bin"
SERVICEEOF

# Configure web backend
uberspace web backend set /api --http --port 8000
uberspace web backend set / --apache

# Add domains (if not already added)
uberspace web domain add gm-tc.tech || echo "Domain already exists"
uberspace web domain add www.gm-tc.tech || echo "Domain already exists"

# Start the service
supervisorctl reread
supervisorctl update
supervisorctl start gmtc-api
```

### Step 3: Build and Deploy Frontend

```bash
# Install Node.js dependencies (if not already installed)
cd ~/gm-tc/frontend
npm install

# Build frontend
npm run build

# Copy build to web root
cp -r dist/* ~/html/

# Set proper permissions
chmod -R 755 ~/html
```

### Step 4: Update Backend to Serve Frontend (Alternative)

If you prefer to serve the frontend from FastAPI instead of Apache:

```bash
# Edit backend/main.py to add static file serving
# Then rebuild and restart
cd ~/gm-tc/backend
supervisorctl restart gmtc-api
```

## Updating After Code Changes

When you push new code:

```bash
# SSH to server
ssh gmtc@gmtc.uber.space

# Update backend
cd ~/gm-tc
git pull origin main

# Update Python dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Run new migrations
alembic upgrade head

# Restart backend
supervisorctl restart gmtc-api

# Update frontend
cd ../frontend
npm install
npm run build
cp -r dist/* ~/html/

# Check status
supervisorctl status gmtc-api
tail -f ~/logs/gmtc-api.log
```

## Verify Deployment

1. **Homepage**: https://gm-tc.tech (should show your new homepage)
2. **Blog**: https://gm-tc.tech/blog
3. **API**: https://gm-tc.tech/api/v1/health
4. **API Docs**: https://gm-tc.tech/docs (if DEBUG=True)

## Troubleshooting

### Check Service Status
```bash
supervisorctl status gmtc-api
```

### View Logs
```bash
# Application logs
tail -f ~/logs/gmtc-api.log

# Error logs
tail -f ~/logs/gmtc-api-error.log
```

### Restart Service
```bash
supervisorctl restart gmtc-api
```

### Check Web Backend
```bash
uberspace web backend list
```

### Check Domains
```bash
uberspace web domain list
```

## Important Notes

1. **Database**: Currently using SQLite. For production, consider PostgreSQL:
   ```bash
   createdb gmtc_crm
   # Then update DATABASE_URL in .env
   ```

2. **Frontend Build**: The frontend is built as static files and served from `~/html/`

3. **API Routes**: All API routes are prefixed with `/api/v1/`

4. **CORS**: Make sure `ALLOWED_ORIGINS` in `.env` includes your domain

5. **SSL**: Uberspace automatically provides SSL certificates

