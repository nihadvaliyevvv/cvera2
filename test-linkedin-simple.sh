#!/bin/bash

echo "🧪 LinkedIn import API test edilir..."

# Test with a simple curl command
curl -X POST 'http://localhost:3000/api/import/linkedin' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3NTMzNTYxMjIyOTgiLCJpYXQiOjE3Mzc3NjU3MjIsImV4cCI6MTczNzg1MjEyMn0.FjEA3H-_6v3KGfLUcFgJUfEr5hK3kKxR7yKdMQZoNMY' \
  -d '{"linkedinUrl": "https://www.linkedin.com/in/detail-test"}' \
  -w "\n📊 Status: %{http_code} | Time: %{time_total}s\n"

echo ""
echo "✅ Test tamamlandı"
