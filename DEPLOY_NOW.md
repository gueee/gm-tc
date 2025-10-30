# Deploy to Uberspace Right Now

## Quick Deployment (15 minutes)

### Step 1: Make Repository Public (Temporary)

On GitHub:
1. Go to https://github.com/gueee/gm-tc/settings
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Make public"
4. Confirm

(We'll make it private again after deployment if you want)

### Step 2: SSH to Uberspace

```bash
ssh gmtc@gmtc.uber.space
```

### Step 3: Run Deployment Commands

Copy and paste these commands one by one:

```bash
# Create directories
mkdir -p ~/gmtc-crm ~/logs ~/backups

# Clone repository
cd ~
git clone https://github.com/gueee/gm-tc.git gmtc-crm

# Set up Python environment
cd gmtc-crm/backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << 'ENVEOF'
DATABASE_URL=sqlite:///./gmtc_crm.db
ENVIRONMENT=production
DEBUG=False
API_PORT=8000
API_HOST=127.0.0.1
SECRET_KEY=CHANGE_THIS_RANDOM_STRING_IN_PRODUCTION
JWT_SECRET_KEY=ANOTHER_RANDOM_STRING_CHANGE_ME
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
ENVEOF

# Generate secure random keys
sed -i "s/CHANGE_THIS_RANDOM_STRING_IN_PRODUCTION/$(openssl rand -hex 32)/" .env
sed -i "s/ANOTHER_RANDOM_STRING_CHANGE_ME/$(openssl rand -hex 32)/" .env

# Run database migrations
alembic upgrade head

# Create supervisord service
mkdir -p ~/etc/services.d
cat > ~/etc/services.d/gmtc-api.ini << 'SERVICEEOF'
[program:gmtc-api]
directory=%(ENV_HOME)s/gmtc-crm/backend
command=%(ENV_HOME)s/gmtc-crm/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=30
stopwaitsecs=60
stdout_logfile=%(ENV_HOME)s/logs/gmtc-api.log
stderr_logfile=%(ENV_HOME)s/logs/gmtc-api-error.log
SERVICEEOF

# Configure web backend
uberspace web backend set / --http --port 8000

# Add domains
uberspace web domain add gm-tc.tech
uberspace web domain add www.gm-tc.tech

# Start the service
supervisorctl reread
supervisorctl update
supervisorctl start gmtc-api

# Check status
supervisorctl status gmtc-api
```

### Step 4: Verify Deployment

```bash
# Check if service is running
supervisorctl status gmtc-api

# View logs
tail -f ~/logs/gmtc-api.log
```

Press `Ctrl+C` to stop viewing logs.

### Step 5: Test Your API!

Open in your browser:
- **https://gm-tc.tech** - Should show API info
- **https://gm-tc.tech/health** - Should show health status
- **https://gmtc.uber.space** - Alternative URL

## Troubleshooting

### Service not starting?

```bash
# Check error logs
tail -n 50 ~/logs/gmtc-api-error.log

# Manual test
cd ~/gmtc-crm/backend
source venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
# Press Ctrl+C to stop, then restart service
supervisorctl restart gmtc-api
```

### Domain not working?

```bash
# Check domain status
uberspace web domain list

# Check backend status
uberspace web backend list

# Verify it should show:
# / http:8000 => OK
```

### Port conflict?

```bash
# Check what's using port 8000
lsof -i :8000

# If something else is using it, change to another port
# Edit ~/etc/services.d/gmtc-api.ini and change 8000 to 8001
# Also update: uberspace web backend set / --http --port 8001
```

## Updating After Changes

When you push new code to GitHub:

```bash
ssh gmtc@gmtc.uber.space
cd ~/gmtc-crm
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
supervisorctl restart gmtc-api
```

## Useful Commands

```bash
# Service management
supervisorctl status          # Check service status
supervisorctl restart gmtc-api  # Restart service
supervisorctl stop gmtc-api    # Stop service
supervisorctl start gmtc-api   # Start service

# Logs
tail -f ~/logs/gmtc-api.log         # View application logs
tail -f ~/logs/gmtc-api-error.log   # View error logs

# Database
cd ~/gmtc-crm/backend
source venv/bin/activate
sqlite3 gmtc_crm.db              # Access database
```

## After Deployment

1. **Test the API**: Visit https://gm-tc.tech
2. **Register first user**: Use the API at `/api/v1/auth/register`
3. **Make repository private again** (optional): Go to GitHub settings

## Success!

Once deployed, your API will be live at:
- **https://gm-tc.tech**
- **https://www.gm-tc.tech**
- **https://gmtc.uber.space**

All with automatic SSL certificates from Let's Encrypt!

---

**Need help?** Check:
- Logs: `tail -f ~/logs/gmtc-api-error.log`
- Service status: `supervisorctl status`
- [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
