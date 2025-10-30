# GM-TC CRM - Uberspace Deployment Guide

This guide contains all information needed to deploy and manage the GM-TC CRM system on Uberspace hosting.

## Server Information

### Access Details
- **Server**: `gmtc.uber.space`
- **Domain**: `gm-tc.tech`
- **SSH Access**: `ssh gmtc@gmtc.uber.space`
- **User**: `gmtc`
- **Hosting Provider**: [Uberspace.de](https://uberspace.de)
- **Documentation**: [Uberspace Manual](https://manual.uberspace.de)

### SSH Key Authentication

SSH keys have been configured for passwordless authentication. The key is stored at:
- **Private Key**: `~/.ssh/gmtc_uberspace`
- **Public Key**: `~/.ssh/gmtc_uberspace.pub`

#### SSH Connection
```bash
# Standard connection
ssh gmtc@gmtc.uber.space

# Using specific key (if not in SSH config)
ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space
```

#### SSH Config Entry
Add to `~/.ssh/config` for easier access:
```
Host gmtc
    HostName gmtc.uber.space
    User gmtc
    IdentityFile ~/.ssh/gmtc_uberspace
    IdentitiesOnly yes
```

Then connect with just: `ssh gmtc`

## Uberspace Directory Structure

### Important Directories

```
/home/gmtc/
├── html/                    # Web root (legacy, not used for modern apps)
├── etc/
│   └── services.d/         # Custom systemd services
├── logs/                   # Application logs
├── .config/
│   └── supervisord.d/     # Daemon configuration (if using supervisord)
├── tmp/                    # Temporary files
└── gmtc-crm/              # Application directory (to be created)
    ├── backend/           # FastAPI application
    ├── frontend/          # React build output
    ├── venv/              # Python virtual environment
    └── .env               # Environment variables
```

### Key Paths
- **Home Directory**: `/home/gmtc/`
- **Web Root**: `/home/gmtc/html/` (symbolic links or proxy to app)
- **Application Directory**: `/home/gmtc/gmtc-crm/`
- **Service Files**: `/home/gmtc/etc/services.d/`
- **Logs**: `/home/gmtc/logs/`

## Initial Server Setup

### 1. First Connection
```bash
# Connect to server
ssh gmtc@gmtc.uber.space

# Check Uberspace version and info
uberspace --version
uberspace tools version list
```

### 2. Set Up Application Directory
```bash
# Create application directory
mkdir -p ~/gmtc-crm
cd ~/gmtc-crm

# Clone repository
git clone https://github.com/gueee/gm-tc.git .
```

### 3. Python Environment Setup
```bash
# Check Python version
python3 --version

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 4. PostgreSQL Database Setup

Uberspace provides PostgreSQL. Set up your database:

```bash
# Create database
createdb gmtc_crm

# Check database connection
psql -d gmtc_crm -c "SELECT version();"

# Get database connection details
echo $PGHOST      # Usually localhost
echo $PGPORT      # Port number
echo $USER        # Database user (same as system user)
```

#### Database Connection String
```
postgresql://gmtc:@localhost:[PORT]/gmtc_crm
```

Replace `[PORT]` with your PostgreSQL port (find with `uberspace db postgresql status`).

## Web Backend Configuration

### Setting Up Web Backend

Uberspace uses web backends to route traffic to your application.

```bash
# Set up web backend for your app (example: running on port 8000)
uberspace web backend set / --http --port 8000

# List current backends
uberspace web backend list

# Check status
uberspace web backend status
```

### Domain Configuration

```bash
# Add your domain
uberspace web domain add gm-tc.tech
uberspace web domain add www.gm-tc.tech

# List domains
uberspace web domain list

# Check SSL certificate status (auto-generated)
uberspace web domain ssl list
```

### HTTPS/SSL

Uberspace automatically provides Let's Encrypt SSL certificates for your domains. Check status:

```bash
# SSL certificates are automatic
# Check certificate status
uberspace web domain ssl list

# Force HTTPS redirect (recommended)
# This happens automatically on Uberspace
```

## Systemd Service Setup

Create a systemd service to run your FastAPI application.

### 1. Create Service File

```bash
# Create service directory if it doesn't exist
mkdir -p ~/etc/services.d/

# Create service file
nano ~/etc/services.d/gmtc-api.ini
```

### 2. Service Configuration

Add to `~/etc/services.d/gmtc-api.ini`:

```ini
[program:gmtc-api]
directory=/home/gmtc/gmtc-crm/backend
command=/home/gmtc/gmtc-crm/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=30
stopwaitsecs=60
stdout_logfile=/home/gmtc/logs/gmtc-api.log
stderr_logfile=/home/gmtc/logs/gmtc-api-error.log
environment=PATH="/home/gmtc/gmtc-crm/venv/bin",DATABASE_URL="postgresql://gmtc:@localhost:[PORT]/gmtc_crm"
```

### 3. Service Management

```bash
# Create log directory
mkdir -p ~/logs

# Restart supervisord to load new service
supervisorctl reread
supervisorctl update

# Start service
supervisorctl start gmtc-api

# Check status
supervisorctl status

# View logs
tail -f ~/logs/gmtc-api.log

# Restart service
supervisorctl restart gmtc-api

# Stop service
supervisorctl stop gmtc-api
```

## File Upload Methods

### 1. SCP (Secure Copy)

```bash
# Upload single file
scp /local/path/file.txt gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/

# Upload directory recursively
scp -r /local/path/directory gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/

# Download from server
scp gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/file.txt /local/path/
```

### 2. SFTP (SSH File Transfer Protocol)

```bash
# Connect via SFTP
sftp gmtc@gmtc.uber.space

# SFTP commands
put /local/file.txt            # Upload file
get /remote/file.txt           # Download file
put -r /local/directory        # Upload directory
lcd /local/path                # Change local directory
cd /remote/path                # Change remote directory
ls                             # List remote files
lls                            # List local files
pwd                            # Print remote working directory
lpwd                           # Print local working directory
```

### 3. rsync (Recommended for Deployments)

```bash
# Sync local directory to server (dry run)
rsync -avz --dry-run /local/path/ gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/

# Actual sync
rsync -avz /local/path/ gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/

# Sync with delete (removes files not in source)
rsync -avz --delete /local/path/ gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/

# Exclude certain files
rsync -avz --exclude 'node_modules' --exclude '.git' /local/path/ gmtc@gmtc.uber.space:/home/gmtc/gmtc-crm/
```

### 4. Git (Recommended)

```bash
# SSH to server
ssh gmtc@gmtc.uber.space

# Pull latest changes
cd ~/gmtc-crm
git pull origin main

# Or clone initially
git clone https://github.com/gueee/gm-tc.git ~/gmtc-crm
```

## Deployment Workflow

### Manual Deployment

```bash
# 1. SSH to server
ssh gmtc@gmtc.uber.space

# 2. Navigate to app directory
cd ~/gmtc-crm

# 3. Pull latest code
git pull origin main

# 4. Activate virtual environment
source venv/bin/activate

# 5. Update dependencies
pip install -r requirements.txt

# 6. Run database migrations
cd backend
alembic upgrade head

# 7. Restart application
supervisorctl restart gmtc-api

# 8. Check status
supervisorctl status gmtc-api
tail -f ~/logs/gmtc-api.log
```

### Automated Deployment Script

Create `deploy.sh` on the server:

```bash
#!/bin/bash
# ~/gmtc-crm/deploy.sh

set -e  # Exit on error

echo "Starting deployment..."

# Navigate to app directory
cd ~/gmtc-crm

# Pull latest changes
echo "Pulling latest code..."
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Update backend dependencies
echo "Updating backend dependencies..."
cd backend
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Build frontend (if applicable)
echo "Building frontend..."
cd ../frontend
npm install
npm run build

# Restart services
echo "Restarting application..."
supervisorctl restart gmtc-api

# Check status
echo "Checking status..."
supervisorctl status gmtc-api

echo "Deployment complete!"
```

Make executable:
```bash
chmod +x ~/gmtc-crm/deploy.sh
```

Run deployment:
```bash
~/gmtc-crm/deploy.sh
```

## Environment Variables

### Create .env File

```bash
# On server
nano ~/gmtc-crm/.env
```

### Example .env Configuration

```bash
# Database
DATABASE_URL=postgresql://gmtc:@localhost:[PORT]/gmtc_crm

# Application
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
API_PORT=8000

# CORS
ALLOWED_ORIGINS=https://gm-tc.tech,https://www.gm-tc.tech

# JWT
JWT_SECRET_KEY=your-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (if using)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=/home/gmtc/gmtc-crm/uploads
```

### Secure .env File

```bash
# Set proper permissions
chmod 600 ~/gmtc-crm/.env

# Never commit to git
echo ".env" >> ~/gmtc-crm/.gitignore
```

## Frontend Deployment

### Static File Serving

#### Option 1: Serve from Backend
```bash
# Build frontend
cd ~/gmtc-crm/frontend
npm run build

# FastAPI will serve from build directory
# Configure in main.py:
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
```

#### Option 2: Separate Web Backend
```bash
# Build frontend
cd ~/gmtc-crm/frontend
npm run build

# Copy build to html directory
cp -r dist/* ~/html/

# Set backend for API only
uberspace web backend set /api --http --port 8000
uberspace web backend set / --apache
```

## Database Management

### Backup Database

```bash
# Create backup
pg_dump gmtc_crm > ~/backups/gmtc_crm_$(date +%Y%m%d_%H%M%S).sql

# Create backup directory
mkdir -p ~/backups

# Automated backup script
cat > ~/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
DB_NAME=gmtc_crm
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${DB_NAME}_${DATE}.sql.gz"
EOF

chmod +x ~/backup_db.sh
```

### Restore Database

```bash
# Restore from backup
psql gmtc_crm < ~/backups/gmtc_crm_backup.sql

# Or from compressed backup
gunzip -c ~/backups/gmtc_crm_backup.sql.gz | psql gmtc_crm
```

### Schedule Automatic Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/gmtc/backup_db.sh
```

## Monitoring & Logs

### Application Logs

```bash
# View live logs
tail -f ~/logs/gmtc-api.log
tail -f ~/logs/gmtc-api-error.log

# View last 100 lines
tail -n 100 ~/logs/gmtc-api.log

# Search logs
grep "ERROR" ~/logs/gmtc-api-error.log
```

### Supervisord Status

```bash
# Check service status
supervisorctl status

# View all supervisor logs
tail -f ~/logs/supervisord.log
```

### Disk Usage

```bash
# Check disk usage
uberspace quota

# Check directory sizes
du -sh ~/gmtc-crm/*
du -sh ~/.local/share/postgresql
```

### System Resources

```bash
# Check running processes
ps aux | grep gmtc

# Check memory usage
free -h

# Check CPU usage
top
```

## Troubleshooting

### Service Not Starting

```bash
# Check service status
supervisorctl status gmtc-api

# Check logs
tail -n 50 ~/logs/gmtc-api-error.log

# Restart service
supervisorctl restart gmtc-api

# Manual test
cd ~/gmtc-crm/backend
source ~/gmtc-crm/venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Database Connection Issues

```bash
# Test database connection
psql -d gmtc_crm -c "SELECT version();"

# Check PostgreSQL status
uberspace db postgresql status

# Check database port
uberspace db postgresql port
```

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill process if needed
kill -9 [PID]

# Or use different port in service config
```

### Permission Issues

```bash
# Fix file permissions
chmod -R 755 ~/gmtc-crm
chmod 600 ~/gmtc-crm/.env

# Fix ownership (should be gmtc:gmtc)
chown -R gmtc:gmtc ~/gmtc-crm
```

### SSL Certificate Issues

```bash
# Check SSL status
uberspace web domain ssl list

# Domains should auto-renew
# If issues, contact Uberspace support
```

## Useful Uberspace Commands

### Web Management

```bash
# List all web backends
uberspace web backend list

# Remove backend
uberspace web backend del /path

# List domains
uberspace web domain list

# Add domain
uberspace web domain add example.com

# Remove domain
uberspace web domain del example.com
```

### Database Management

```bash
# PostgreSQL status
uberspace db postgresql status

# Get database port
uberspace db postgresql port

# List databases
psql -l
```

### Service Management

```bash
# List all services
supervisorctl status

# Restart all services
supervisorctl restart all

# Update configuration
supervisorctl reread
supervisorctl update
```

## CI/CD with GitHub Actions

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Uberspace

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: gmtc.uber.space
        username: gmtc
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd ~/gmtc-crm
          git pull origin main
          source venv/bin/activate
          pip install -r requirements.txt
          cd backend
          alembic upgrade head
          supervisorctl restart gmtc-api
```

### Add SSH Key to GitHub Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Add new secret: `SSH_PRIVATE_KEY`
3. Paste contents of `~/.ssh/gmtc_uberspace` (private key)

## Quick Reference

### Common Tasks

```bash
# Connect to server
ssh gmtc@gmtc.uber.space

# Deploy latest changes
cd ~/gmtc-crm && git pull && supervisorctl restart gmtc-api

# View logs
tail -f ~/logs/gmtc-api.log

# Backup database
pg_dump gmtc_crm > ~/backups/backup_$(date +%Y%m%d).sql

# Check service status
supervisorctl status

# Restart service
supervisorctl restart gmtc-api
```

### Important URLs

- **Production Site**: https://gm-tc.tech
- **Uberspace Manual**: https://manual.uberspace.de
- **Uberspace Dashboard**: https://uberspace.de/dashboard
- **Repository**: https://github.com/gueee/gm-tc

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Keep SSH keys secure** - Never share private keys
3. **Regular backups** - Automate daily database backups
4. **Update dependencies** - Regular security updates
5. **Monitor logs** - Check for suspicious activity
6. **Use HTTPS only** - Enforce SSL/TLS
7. **Limit SSH access** - Use key-based authentication only
8. **Set file permissions** - Proper chmod on sensitive files

## Support

- **Uberspace Support**: https://uberspace.de/support
- **Uberspace Manual**: https://manual.uberspace.de
- **Community Forum**: https://forum.uberspace.de

---

**Last Updated**: October 30, 2025
**Maintainer**: GM-TC Development Team
