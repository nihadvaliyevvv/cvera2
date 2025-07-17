#!/bin/bash

# Epoint.az API endpoint yoxlama scripti

echo "Epoint.az API endpoint-lərini yoxlayır..."

# Müxtəlif ehtimal olunan endpoint-lər
endpoints=(
    "https://epoint.az/api/payment/create"
    "https://epoint.az/api/v1/payment/create"
    "https://epoint.az/api/checkout"
    "https://epoint.az/api/payment"
    "https://epoint.az/payment/create"
    "https://epoint.az/checkout/create"
    "https://epoint.az/api/request"
    "https://epoint.az/gateway/payment"
    "https://merchant.epoint.az/api/payment"
    "https://pay.epoint.az/api/create"
)

for endpoint in "${endpoints[@]}"; do
    echo "Yoxlanır: $endpoint"
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "public_key=i000200891&amount=1&currency=AZN" \
        "$endpoint" 2>/dev/null)
    
    if [ "$response" != "404" ] && [ "$response" != "000" ]; then
        echo "✅ $endpoint - HTTP Status: $response"
    else
        echo "❌ $endpoint - HTTP Status: $response (404 və ya əlaqə yoxdur)"
    fi
    sleep 1
done

echo "Yoxlama tamamlandı!"
