#!/bin/bash

echo "🚀 LinkedIn Scraper Final Test"
echo "=============================="

# Kill any existing dev server
pkill -f "next dev" 2>/dev/null || true

# Start server in background
echo "📡 Starting development server..."
cd /home/musayev/Documents/lastcvera
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server startup..."
sleep 15

# Find the port
PORT=$(grep -o "localhost:[0-9]*" server.log | head -1 | cut -d: -f2)
if [ -z "$PORT" ]; then
    PORT=3000
fi

echo "🔌 Server running on port: $PORT"

# Test the endpoint
echo "🔍 Testing LinkedIn scraper endpoint..."
echo "URL: https://www.linkedin.com/in/musayevcreate"

curl -X POST "http://localhost:$PORT/api/import/linkedin" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.linkedin.com/in/musayevcreate"}' \
    --max-time 180 \
    --connect-timeout 30 \
    -v

echo -e "\n=============================="
echo "🛑 Stopping server..."
kill $SERVER_PID 2>/dev/null || true

echo "✅ Test completed!"
echo "Check server.log for detailed logs"
