#!/bin/bash
# Fix supervisor service configuration for Uberspace

set -e

echo "========================================="
echo "Fixing Supervisor Service"
echo "========================================="
echo ""

# Get home directory
HOME_DIR=$(echo $HOME)
echo "Home directory: $HOME_DIR"

# Check if backend exists
if [ ! -d "$HOME_DIR/gm-tc/backend" ]; then
    echo "ERROR: Backend directory not found at $HOME_DIR/gm-tc/backend"
    exit 1
fi

# Check if venv exists
if [ ! -d "$HOME_DIR/gm-tc/backend/venv" ]; then
    echo "ERROR: Virtual environment not found. Creating it..."
    cd $HOME_DIR/gm-tc/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
fi

# Check if uvicorn exists
if [ ! -f "$HOME_DIR/gm-tc/backend/venv/bin/uvicorn" ]; then
    echo "ERROR: uvicorn not found in venv"
    exit 1
fi

# Create logs directory
mkdir -p $HOME_DIR/logs

# Create service file with absolute paths
echo "Creating service file..."
cat > $HOME_DIR/etc/services.d/gmtc-api.ini << EOF
[program:gmtc-api]
directory=$HOME_DIR/gm-tc/backend
command=$HOME_DIR/gm-tc/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
autostart=yes
autorestart=yes
startsecs=10
stopwaitsecs=30
stdout_logfile=$HOME_DIR/logs/gmtc-api.log
stderr_logfile=$HOME_DIR/logs/gmtc-api-error.log
environment=PATH="$HOME_DIR/gm-tc/backend/venv/bin:$PATH"
EOF

echo "Service file created:"
cat $HOME_DIR/etc/services.d/gmtc-api.ini
echo ""

# Test the command manually
echo "Testing command manually..."
cd $HOME_DIR/gm-tc/backend
$HOME_DIR/gm-tc/backend/venv/bin/uvicorn --version
echo ""

# Reload supervisor
echo "Reloading supervisor..."
supervisorctl reread
supervisorctl update

echo ""
echo "Starting service..."
supervisorctl start gmtc-api

echo ""
echo "Waiting 3 seconds..."
sleep 3

echo ""
echo "Service status:"
supervisorctl status gmtc-api

echo ""
echo "Recent logs:"
tail -n 10 $HOME_DIR/logs/gmtc-api.log 2>/dev/null || echo "No logs yet"
tail -n 10 $HOME_DIR/logs/gmtc-api-error.log 2>/dev/null || echo "No error logs"

echo ""
echo "========================================="
echo "Done!"
echo "========================================="

