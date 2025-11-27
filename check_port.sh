#!/bin/bash
# Check what's using port 8000 and fix it

echo "========================================="
echo "Checking Port 8000"
echo "========================================="
echo ""

# Check what's using port 8000
echo "Processes using port 8000:"
lsof -i :8000 || echo "No process found (or lsof not available)"

echo ""
echo "Checking supervisor status:"
supervisorctl status gmtc-api

echo ""
echo "Checking if service is actually running:"
ps aux | grep uvicorn | grep -v grep

echo ""
echo "========================================="
echo "Fixing..."
echo "========================================="

# Stop the service first
echo "Stopping service..."
supervisorctl stop gmtc-api 2>/dev/null || echo "Service not running in supervisor"

# Kill any processes on port 8000
echo "Killing any processes on port 8000..."
lsof -ti :8000 | xargs kill -9 2>/dev/null || echo "No processes to kill"

# Wait a moment
sleep 2

# Start the service
echo "Starting service..."
supervisorctl start gmtc-api

# Wait a moment
sleep 3

# Check status
echo ""
echo "Service status:"
supervisorctl status gmtc-api

echo ""
echo "Recent logs:"
tail -n 10 ~/logs/gmtc-api.log 2>/dev/null || echo "No logs yet"

echo ""
echo "Test if port is accessible:"
curl -s http://127.0.0.1:8000/health | head -3 || echo "Port not responding"

