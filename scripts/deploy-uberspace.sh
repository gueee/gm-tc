#!/bin/bash
# GM-TC Deployment Script for Uberspace
# Run this script on Uberspace after cloning the repository
# SSH: ssh gmtc@gmtc.uber.space

set -e

# Configuration
APP_NAME="gmtc"
APP_DIR="$HOME/gm-tc"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"
PYTHON_VERSION="3.11"

echo "=== GM-TC Deployment Script ==="
echo ""

# 1. Clone or update repository
if [ -d "$APP_DIR" ]; then
    echo "Updating repository..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/gueee/gm-tc.git "$APP_DIR"
    cd "$APP_DIR"
fi

# 2. Set up Python environment
echo ""
echo "Setting up Python virtual environment..."
cd "$BACKEND_DIR"

# Check Python version available on Uberspace
PYTHON_CMD=$(which python$PYTHON_VERSION || which python3)
echo "Using Python: $PYTHON_CMD"

if [ ! -d "$VENV_DIR" ]; then
    $PYTHON_CMD -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r requirements.txt

# 3. Create .env file if not exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo ""
    echo "Creating .env file..."
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"

    # Generate secure keys
    SECRET_KEY=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)

    sed -i "s/change-this-secret-key-in-production/$SECRET_KEY/g" "$BACKEND_DIR/.env"
    sed -i "s/change-this-jwt-secret-in-production/$JWT_SECRET/g" "$BACKEND_DIR/.env"
    sed -i "s/ENVIRONMENT=development/ENVIRONMENT=production/g" "$BACKEND_DIR/.env"
    sed -i "s/DEBUG=True/DEBUG=False/g" "$BACKEND_DIR/.env"

    echo "Generated secure keys in .env"
    echo "IMPORTANT: Edit .env to configure ALLOWED_ORIGINS for your domain!"
fi

# 4. Initialize database
echo ""
echo "Initializing database..."
cd "$BACKEND_DIR"
python seed.py

# 5. Set up supervisord
echo ""
echo "Setting up supervisord..."

SUPERVISOR_CONF="$HOME/etc/services.d/$APP_NAME.ini"
mkdir -p "$HOME/etc/services.d"

cat > "$SUPERVISOR_CONF" << EOF
[program:$APP_NAME]
command=$VENV_DIR/bin/uvicorn main:app --host 0.0.0.0 --port 8000
directory=$BACKEND_DIR
environment=HOME="$HOME",PATH="$VENV_DIR/bin:%(ENV_PATH)s"
autostart=true
autorestart=true
startsecs=10
startretries=3
stdout_logfile=$HOME/logs/$APP_NAME.log
stderr_logfile=$HOME/logs/$APP_NAME-error.log
EOF

mkdir -p "$HOME/logs"

echo "Created supervisord config: $SUPERVISOR_CONF"

# 6. Set up web backend
echo ""
echo "Setting up web backend..."
uberspace web backend set /api --http --port 8000

# 7. Restart services
echo ""
echo "Reloading supervisord..."
supervisorctl reread
supervisorctl update
supervisorctl restart $APP_NAME || supervisorctl start $APP_NAME

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Backend running at: https://gm-tc.tech/api"
echo "API docs at: https://gm-tc.tech/api/docs"
echo ""
echo "To check status: supervisorctl status $APP_NAME"
echo "To view logs: tail -f ~/logs/$APP_NAME.log"
echo ""
echo "Next steps:"
echo "1. Edit $BACKEND_DIR/.env to set ALLOWED_ORIGINS"
echo "2. Create admin user via API or seed script"
echo "3. Deploy frontend (see scripts/deploy-frontend.sh)"
