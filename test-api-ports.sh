#!/bin/bash

# Test templates API on different ports
echo "🔍 Testing Templates API on different ports..."

for port in 3000 3001 3002 3003; do
  echo "Testing port $port..."
  response=$(curl -s "http://localhost:$port/api/templates" 2>/dev/null)
  
  if [ $? -eq 0 ] && [ ! -z "$response" ]; then
    echo "✅ Port $port is working!"
    echo "Response (first 200 chars): ${response:0:200}..."
    
    # Test if it contains templates
    if echo "$response" | grep -q "templates"; then
      echo "✅ Response contains templates data"
      echo "Full response:"
      echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
      break
    else
      echo "❌ Response doesn't contain templates"
    fi
  else
    echo "❌ Port $port not responding"
  fi
  echo ""
done

echo "Done testing!"
