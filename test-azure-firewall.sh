#!/bin/bash
# Azure PostgreSQL Firewall Test Script

echo "🔥 Azure PostgreSQL Firewall Test"
echo "================================="

# Test server connectivity
echo "🌐 Testing server connectivity..."
if ping -c 3 cvera.postgres.database.azure.com; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable"
    echo "Possible issues:"
    echo "1. Server name is incorrect"
    echo "2. Server is not running"
    echo "3. Network connectivity issues"
fi

# Test port connectivity
echo "🔌 Testing port 5432 connectivity..."
if nc -z cvera.postgres.database.azure.com 5432; then
    echo "✅ Port 5432 is open"
else
    echo "❌ Port 5432 is blocked"
    echo "Possible issues:"
    echo "1. Azure firewall rules are blocking connection"
    echo "2. Local firewall is blocking connection"
    echo "3. Server is not listening on port 5432"
fi

# Get public IP
echo "🌍 Your public IP address:"
curl -s ipinfo.io/ip

echo ""
echo "📋 To fix firewall issues:"
echo "1. Go to Azure Portal"
echo "2. Navigate to your PostgreSQL server"
echo "3. Go to 'Networking' or 'Connection security'"
echo "4. Add your public IP to firewall rules"
echo "5. Or enable 'Allow access to Azure services'"
echo ""
echo "🔧 Alternative connection string formats to try:"
echo "postgres://admincvera:{ilqarilqar1M@}@cvera.postgres.database.azure.com:5432/postgres?sslmode=require"
echo "postgres://admincvera@cvera:{ilqarilqar1M@}@cvera.postgres.database.azure.com:5432/postgres?sslmode=require"
