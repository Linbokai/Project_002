#!/bin/bash
set -e

APP_DIR="$HOME/ai-model-hub"
PORT=8080

# Kill existing server
pkill -f "python3 server.py" 2>/dev/null || true
sleep 1

# Setup
cd "$APP_DIR"
cp deploy/server.py .

# Start server in background
nohup python3 server.py $PORT > server.log 2>&1 &
sleep 2

# Verify
echo "=== server.log ==="
cat server.log
echo "=== curl test ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/)
echo "HTTP status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "DEPLOY_SUCCESS on port $PORT"
else
    echo "DEPLOY_FAILED"
fi
