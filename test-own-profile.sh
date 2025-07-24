#!/bin/bash

echo "🚀 Öz LinkedIn Profil Import Test"
echo "=================================="

# Test məlumatları daxil edin
read -p "LinkedIn Email: " EMAIL
read -s -p "LinkedIn Password: " PASSWORD
echo

echo "📡 API request göndərilir..."

# API request
curl -X POST http://localhost:3000/api/import/linkedin/own \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  | jq '.' 2>/dev/null || cat

echo
echo "✅ Test tamamlandı!"

# Əlavə məlumat
echo
echo "📝 Digər test variantları:"
echo "1. Browser test: http://localhost:3000/test-own-linkedin.html"
echo "2. Manual URL test: http://localhost:3000/test-linkedin-login.html"
