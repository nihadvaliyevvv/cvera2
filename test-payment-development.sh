#!/bin/bash

echo "🧪 Testing CVera Payment System - Development Mode"
echo "=================================================="

# Test 1: Check if server starts correctly
echo -e "\n1️⃣ Starting development server..."
cd /home/musayev/Documents/lastcvera

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test 2: Check if payment creation works
echo -e "\n2️⃣ Testing payment creation..."

# Create a test token (this would normally come from login)
echo "Please test manually by:"
echo "1. Go to http://localhost:3000"
echo "2. Register/Login with a test account"
echo "3. Go to /pricing page"
echo "4. Try to purchase Medium plan (2.97 AZN)"
echo "5. Check if development payment URL is generated"
echo ""
echo "Expected result: Payment should redirect to success page with development=true parameter"

# Wait for user input
read -p "Press Enter when you want to stop the test server..."

# Clean up
kill $SERVER_PID
echo -e "\n✅ Test completed. Server stopped."
