#!/bin/bash

echo "🚀 LinkedIn HTML Scraper Test başlayır..."
echo "==========================================="

# Server-i background-da başlat
echo "📡 Development server başladılır..."
npm run dev &
SERVER_PID=$!

# 10 saniyə gözlə
echo "⏳ Server-in başlaması üçün gözləyirik..."
sleep 10

# LinkedIn import API-ni test et
echo "🔍 LinkedIn import endpoint test edilir..."
curl -X POST "http://localhost:3000/api/import/linkedin" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.linkedin.com/in/musayevcreate"}' \
  --max-time 120 \
  --connect-timeout 30

echo -e "\n"
echo "==========================================="

# Server-i dayandır
echo "🛑 Server dayandırılır..."
kill $SERVER_PID

echo "✅ Test tamamlandı!"
