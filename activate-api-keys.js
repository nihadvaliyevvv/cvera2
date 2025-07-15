#!/usr/bin/env node

// Activate all LinkedIn API keys
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Load .env.local file
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  console.log('=== Activating LinkedIn API Keys ===\n');

  // Activate all LinkedIn API keys
  const result = await prisma.apiKey.updateMany({
    where: {
      service: 'linkedin'
    },
    data: {
      active: true
    }
  });

  console.log(`✅ Activated ${result.count} LinkedIn API keys`);

  // Show updated status
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      service: 'linkedin'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('\nUpdated API keys:');
  apiKeys.forEach((key, index) => {
    const status = key.active ? '✅ Active' : '❌ Inactive';
    console.log(`${index + 1}. ${key.name}: ${status}`);
  });
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
