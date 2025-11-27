#!/bin/bash
# Automated fix script to run on Uberspace server

set -e

echo "========================================="
echo "Auto-Fixing Uberspace Deployment"
echo "========================================="
echo ""

# Get home directory
HOME_DIR=$(echo $HOME)
echo "Home directory: $HOME_DIR"
echo ""

# Step 1: Check current status
echo "[1/6] Checking current status..."
supervisorctl status 2>/dev/null || echo "Supervisor not responding"
echo ""

# Step 2: Kill any processes on port 8000
echo "[2/6] Cleaning up port 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null || echo "No processes to kill"
sleep 2
echo ""

# Step 3: Ensure directories exist
echo "[3/6] Creating directories..."
mkdir -p ~/etc/services.d
mkdir -p ~/logs
mkdir -p ~/html
echo "✓ Directories created"
echo ""

# Step 4: Create/update service file
echo "[4/6] Creating service file..."
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
echo "✓ Service file created"
cat ~/etc/services.d/gmtc-api.ini
echo ""

# Step 5: Reload supervisor
echo "[5/6] Reloading supervisor..."
supervisorctl reread
supervisorctl update
echo ""

# Step 6: Start service
echo "[6/6] Starting service..."
supervisorctl stop gmtc-api 2>/dev/null || echo "Service not running"
sleep 1
supervisorctl start gmtc-api
sleep 3

echo ""
echo "========================================="
echo "Final Status"
echo "========================================="
supervisorctl status gmtc-api

echo ""
echo "Testing API..."
curl -s http://127.0.0.1:8000/health 2>/dev/null && echo "✓ API is responding!" || echo "✗ API not responding"

echo ""
echo "Recent logs:"
tail -n 5 ~/logs/gmtc-api.log 2>/dev/null || echo "No logs yet"

echo ""
echo "========================================="
echo "Done!"
echo "========================================="

