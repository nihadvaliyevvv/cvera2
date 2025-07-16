#!/bin/bash
# Azure PostgreSQL Migration Script
# This script will help you migrate from Neon to Azure PostgreSQL

echo "🔄 CVera Azure PostgreSQL Migration Script"
echo "=========================================="

# Create backup of current database
echo "📦 Creating backup of current database..."
npm run db:backup

# Check if new Azure DATABASE_URL is provided
if [ -z "$AZURE_DATABASE_URL" ]; then
    echo "❌ Error: Please provide AZURE_DATABASE_URL environment variable "
    echo "Usage: AZURE_DATABASE_URL='your-azure-connection-string' ./migrate-to-azure.sh"
    exit 1
fi

# Update .env files with Azure connection string
echo "🔧 Updating environment files..."
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$AZURE_DATABASE_URL|g" .env
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$AZURE_DATABASE_URL|g" .env.local
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$AZURE_DATABASE_URL|g" .env.production
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$AZURE_DATABASE_URL|g" .env.example

# Update other related database URLs
echo "🔄 Updating related database configurations..."
sed -i.bak "s|DATABASE_URL_UNPOOLED=.*|DATABASE_URL_UNPOOLED=$AZURE_DATABASE_URL|g" .env.local
sed -i.bak "s|POSTGRES_URL=.*|POSTGRES_URL=$AZURE_DATABASE_URL|g" .env.local
sed -i.bak "s|POSTGRES_PRISMA_URL=.*|POSTGRES_PRISMA_URL=$AZURE_DATABASE_URL|g" .env.local

# Generate new Prisma client
echo "🏗️  Generating new Prisma client..."
npx prisma generate

# Deploy migrations to Azure PostgreSQL
echo "🚀 Deploying migrations to Azure PostgreSQL..."
npx prisma migrate deploy

# Seed the database with initial data
echo "🌱 Seeding Azure PostgreSQL with initial data..."
npx prisma db seed

# Test the connection
echo "🧪 Testing Azure PostgreSQL connection..."
npm run db:test

echo "✅ Migration to Azure PostgreSQL completed successfully!"
echo "🔗 Your application is now using Azure PostgreSQL"
echo "📄 Backup files created with .bak extension"
echo "🌐 Don't forget to update your production environment variables"
