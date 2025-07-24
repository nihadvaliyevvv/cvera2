#!/bin/bash

echo "🧪 Testing working API key directly with RapidAPI..."

# The working API key you provided
API_KEY="736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d"
HOST="fresh-linkedin-profile-data.p.rapidapi.com"
LINKEDIN_URL="https://linkedin.com/in/detail-test"

echo "🔑 API Key: ${API_KEY:0:20}..."
echo "🏠 Host: $HOST"
echo "🔗 LinkedIn URL: $LINKEDIN_URL"
echo ""

# Test different endpoints
endpoints=(
  "GET:/"
  "POST:/get-profile"
  "POST:/get-linkedin-profile"
  "POST:/profile"
  "POST:/scrape"
  "POST:/api/profile"
  "POST:/linkedin-profile"
  "GET:/get-profile"
  "GET:/profile"
)

for endpoint_info in "${endpoints[@]}"; do
  IFS=':' read -r method path <<< "$endpoint_info"
  
  echo "🧪 Testing: $method https://$HOST$path"
  
  if [ "$method" = "GET" ]; then
    if [ "$path" = "/" ]; then
      curl -s -w "\n📊 Status: %{http_code} | Time: %{time_total}s\n" \
        -H "X-RapidAPI-Key: $API_KEY" \
        -H "X-RapidAPI-Host: $HOST" \
        "https://$HOST$path"
    else
      curl -s -w "\n📊 Status: %{http_code} | Time: %{time_total}s\n" \
        -H "X-RapidAPI-Key: $API_KEY" \
        -H "X-RapidAPI-Host: $HOST" \
        "https://$HOST$path?linkedin_url=$LINKEDIN_URL"
    fi
  else
    curl -s -w "\n📊 Status: %{http_code} | Time: %{time_total}s\n" \
      -X POST \
      -H "X-RapidAPI-Key: $API_KEY" \
      -H "X-RapidAPI-Host: $HOST" \
      -H "Content-Type: application/json" \
      -d "{\"linkedin_url\": \"$LINKEDIN_URL\"}" \
      "https://$HOST$path"
  fi
  
  echo "───────────────────────────────────────"
  echo ""
done
