#!/bin/bash
# Fix supervisor service configuration

echo "Checking service configuration..."

# Check if service file exists
if [ -f ~/etc/services.d/gmtc-api.ini ]; then
    echo "Current service file:"
    cat ~/etc/services.d/gmtc-api.ini
    echo ""
fi

# Check logs
echo "Checking error logs:"
tail -n 20 ~/logs/gmtc-api-error.log 2>/dev/null || echo "No error log found"

echo ""
echo "Checking if paths exist:"
echo "Backend directory:"
ls -la ~/gm-tc/backend/ 2>/dev/null | head -5 || echo "Directory not found"
echo ""
echo "Virtual environment:"
ls -la ~/gm-tc/backend/venv/bin/uvicorn 2>/dev/null || echo "uvicorn not found"

echo ""
echo "Testing manual start:"
cd ~/gm-tc/backend
source venv/bin/activate
which uvicorn
uvicorn --version

