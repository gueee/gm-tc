# Uberspace Server Setup Guide

This document describes the one-time setup required on the Uberspace server before running the deployment script.

## Prerequisites

- SSH access to `gmtc@gmtc.uber.space`
- GitHub SSH key configured for repository access

## Step 1: Clone Repository

```bash
ssh gmtc@gmtc.uber.space

# Create repos directory
mkdir -p ~/repos
cd ~/repos

# Clone the repository
git clone git@github.com:gueee/gm-tc.git
cd gm-tc
```

## Step 2: Set Up Python Backend

```bash
cd ~/repos/gm-tc/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create the database and run migrations
alembic upgrade head

# Seed initial data
python seed_data.py

# Test the API locally
uvicorn main:app --host 127.0.0.1 --port 8000
# Ctrl+C to stop
```

## Step 3: Configure Supervisord (API Service)

Create the service configuration file:

```bash
mkdir -p ~/etc/services.d
cat > ~/etc/services.d/gmtc-api.ini << 'EOF'
[program:gmtc-api]
command=/home/gmtc/repos/gm-tc/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
directory=/home/gmtc/repos/gm-tc/backend
autostart=yes
autorestart=yes
startsecs=10
stderr_logfile=/home/gmtc/logs/gmtc-api.err.log
stdout_logfile=/home/gmtc/logs/gmtc-api.out.log
EOF
```

Create logs directory and reload supervisord:

```bash
mkdir -p ~/logs
supervisorctl reread
supervisorctl update
supervisorctl status
```

## Step 4: Configure Web Backend

Route `/api` requests to the uvicorn backend:

```bash
uberspace web backend set /api --http --port 8000
```

Verify:

```bash
uberspace web backend list
```

## Step 5: Set Up Node.js

```bash
# Set Node.js version
uberspace tools version use node 20

# Verify
node --version
npm --version
```

## Step 6: Install Deployment Script

```bash
mkdir -p ~/bin
cp ~/repos/gm-tc/scripts/deploy.sh ~/bin/deploy-gm-tc.sh
chmod +x ~/bin/deploy-gm-tc.sh
```

## Step 7: First Deployment

```bash
~/bin/deploy-gm-tc.sh
```

## Verification

1. Check API health:
   ```bash
   curl https://gm-tc.tech/api/v1/health
   ```

2. Check frontend:
   ```bash
   curl -I https://gm-tc.tech
   ```

3. Check service status:
   ```bash
   supervisorctl status gmtc-api
   ```

## Environment Variables (Optional)

Create a `.env` file in the backend directory for production secrets:

```bash
cat > ~/repos/gm-tc/backend/.env << 'EOF'
DEBUG=false
JWT_SECRET_KEY=your-production-secret-key-here
DATABASE_URL=sqlite:///./gmtc_crm.db
EOF
```

**Important:** Generate a secure JWT secret key for production:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Troubleshooting

### Check Logs

```bash
# API logs
tail -f ~/logs/gmtc-api.err.log
tail -f ~/logs/gmtc-api.out.log

# Apache logs
tail -f ~/logs/error_log_apache
tail -f ~/logs/access_log
```

### Restart Services

```bash
# Restart API
supervisorctl restart gmtc-api

# Restart Apache (usually not needed)
# Apache restarts automatically
```

### Database Issues

```bash
cd ~/repos/gm-tc/backend
source venv/bin/activate

# Reset database (WARNING: destroys data)
rm gmtc_crm.db
alembic upgrade head
python seed_data.py
```

## Domain Configuration

If not already configured:

```bash
uberspace web domain add gm-tc.tech
uberspace web domain add www.gm-tc.tech
```

HTTPS is automatically provided via Let's Encrypt.

