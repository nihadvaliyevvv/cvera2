#!/bin/bash
# Test Azure PostgreSQL Connection

echo "🧪 Testing Azure PostgreSQL Connection"
echo "======================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set. Please update your .env file with Azure PostgreSQL connection string."
    exit 1
fi

echo "🔗 Testing connection to: $(echo $DATABASE_URL | sed 's/:.*@/@***@/g')"

# Test Prisma connection
echo "🔍 Testing Prisma connection..."
npx prisma db pull --preview-feature 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Prisma can connect to Azure PostgreSQL"
else
    echo "❌ Prisma cannot connect to Azure PostgreSQL"
    echo "Please check your connection string and network settings"
    exit 1
fi

# Test basic query
echo "🧮 Testing basic database query..."
npm run db:test

# Check migrations status
echo "📋 Checking migrations status..."
npx prisma migrate status

echo "🎉 Azure PostgreSQL connection test completed!"
echo "📝 Next steps:"
echo "   1. Run migrations: npx prisma migrate deploy"
echo "   2. Seed database: npm run db:seed"
echo "   3. Test application: npm run dev"
