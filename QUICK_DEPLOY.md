# Quick Deploy to Uberspace

## Step-by-Step Instructions

### 1. Connect to Uberspace

Open your terminal and run:

```bash
ssh gmtc@gmtc.uber.space
```

When prompted, enter password: `US_reJect78`

### 2. Upload and Run Deployment Script

**Option A: Copy script to server**

From your local machine (in a new terminal, while still connected via SSH):

```bash
# From your local machine
scp deploy_uberspace.sh gmtc@gmtc.uber.space:~/deploy.sh
```

Then on the server:
```bash
chmod +x ~/deploy.sh
~/deploy.sh
```

**Option B: Manual deployment (copy-paste commands)**

Once connected via SSH, run these commands one by one:

```bash
# Create directories
mkdir -p ~/logs ~/backups ~/html

# Clone or update repository
cd ~
if [ -d "gm-tc" ]; then
    cd gm-tc
    git pull origin main
else
    git clone https://github.com/gueee/gm-tc.git
    cd gm-tc
fi

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file (only if it doesn't exist)
if [ ! -f ".env" ]; then
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
ALLOWED_ORIGINS=https://gm-tc.tech,https://www.gm-tc.tech,https://gm-tc.uber.space
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
    sed -i "s|\$(openssl rand -hex 32)|$SECRET|" .env
    sed -i "s|\$(openssl rand -hex 32)|$JWT_SECRET|" .env
fi

# Run migrations
alembic upgrade head

# Frontend setup
cd ../frontend
npm install
npm run build

# Deploy frontend
cp -r dist/* ~/html/
chmod -R 755 ~/html

# Service setup
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

# Configure web backends
uberspace web backend set /api --http --port 8000
uberspace web backend set / --apache

# Add domains
uberspace web domain add gm-tc.tech 2>/dev/null || echo "Domain exists"
uberspace web domain add www.gm-tc.tech 2>/dev/null || echo "Domain exists"

# Start service
supervisorctl reread
supervisorctl update
supervisorctl restart gmtc-api || supervisorctl start gmtc-api

# Check status
supervisorctl status gmtc-api
```

### 3. Verify Deployment

After deployment completes, check:

```bash
# Service status
supervisorctl status gmtc-api

# View logs
tail -f ~/logs/gmtc-api.log
```

Then visit in your browser:
- **Homepage**: https://gm-tc.tech
- **Blog**: https://gm-tc.tech/blog
- **API Health**: https://gm-tc.tech/api/v1/health

## Updating After Code Changes

When you push new code to GitHub:

```bash
ssh gmtc@gmtc.uber.space
cd ~/gm-tc
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
supervisorctl restart gmtc-api

# Frontend
cd ../frontend
npm install
npm run build
cp -r dist/* ~/html/
```

## Troubleshooting

### Service won't start
```bash
tail -n 50 ~/logs/gmtc-api-error.log
```

### Check if port is in use
```bash
lsof -i :8000
```

### Manual test
```bash
cd ~/gm-tc/backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Restart service
```bash
supervisorctl restart gmtc-api
```

## What Gets Deployed

✅ **Backend API** - FastAPI application on port 8000
✅ **Frontend** - React app built and served from ~/html
✅ **Database** - SQLite database (can upgrade to PostgreSQL later)
✅ **Blog CMS** - Full blog system with admin interface
✅ **Homepage** - Your new personality-driven homepage
✅ **Hidden CRM Login** - Easter egg login link

## Important URLs

- Homepage: https://gm-tc.tech
- Blog: https://gm-tc.tech/blog
- Blog Admin: https://gm-tc.tech/blog/admin (requires login)
- API: https://gm-tc.tech/api/v1/
- API Docs: https://gm-tc.tech/docs (if DEBUG=True)

