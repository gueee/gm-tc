#!/bin/bash
# Check and fix supervisor service

echo "========================================="
echo "Checking Supervisor Services"
echo "========================================="
echo ""

# List all services
echo "All supervisor services:"
supervisorctl status

echo ""
echo "Checking service file:"
cat ~/etc/services.d/gmtc-api.ini 2>/dev/null || echo "Service file not found"

echo ""
echo "Checking correct service name..."
supervisorctl status gmtc-api

echo ""
echo "If service doesn't exist, let's fix it:"
echo "1. Checking if service file exists..."
if [ -f ~/etc/services.d/gmtc-api.ini ]; then
    echo "✓ Service file exists"
    echo ""
    echo "2. Reloading supervisor..."
    supervisorctl reread
    supervisorctl update
    echo ""
    echo "3. Starting service..."
    supervisorctl start gmtc-api
    echo ""
    echo "4. Checking status..."
    supervisorctl status gmtc-api
else
    echo "✗ Service file not found!"
    echo "Creating it now..."
    
    HOME_DIR=$(echo $HOME)
    mkdir -p ~/etc/services.d
    mkdir -p ~/logs
    
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
    
    echo "Service file created!"
    supervisorctl reread
    supervisorctl update
    supervisorctl start gmtc-api
    supervisorctl status gmtc-api
fi

echo ""
echo "Testing API:"
curl -s http://127.0.0.1:8000/health 2>/dev/null | head -3 || echo "API not responding"

