#!/usr/bin/env node

// Test script to diagnose LinkedIn import issues
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
  console.log('=== LinkedIn Import Diagnostic Test ===\n');

  // Check API keys in database
  console.log('1. Checking API keys in database...');
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      service: 'linkedin'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (apiKeys.length === 0) {
    console.log('   ❌ No LinkedIn API keys found in database');
    return;
  }

  console.log(`   Found ${apiKeys.length} LinkedIn API keys:`);
  apiKeys.forEach((key, index) => {
    const status = key.active ? '✅ Active' : '❌ Inactive';
    console.log(`   ${index + 1}. ${key.name}`);
    console.log(`      Status: ${status}`);
    console.log(`      Usage: ${key.usageCount} times`);
    console.log(`      Last Result: ${key.lastResult || 'Never used'}`);
    console.log(`      Last Used: ${key.lastUsed ? key.lastUsed.toISOString() : 'Never'}`);
    console.log(`      Deactivated: ${key.deactivatedAt ? key.deactivatedAt.toISOString() : 'Never'}`);
    console.log(`      Key: ${key.key.substring(0, 20)}...`);
    console.log('');
  });

  const activeKeys = apiKeys.filter(key => key.active);
  console.log(`   Active keys: ${activeKeys.length}/${apiKeys.length}`);

  // Check environment variables
  console.log('2. Checking environment variables...');
  console.log(`   RAPIDAPI_HOST: ${process.env.RAPIDAPI_HOST || 'undefined'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.RAPIDAPI_HOST) {
    console.log('   ❌ RAPIDAPI_HOST is missing!');
    return;
  }

  console.log(`   ✅ Environment looks good`);

  // Test actual API call
  console.log('3. Testing actual API call...');
  
  const testUrl = 'https://www.linkedin.com/in/elon-musk';
  const testKey = activeKeys[0];
  
  if (!testKey) {
    console.log('   ❌ No active API key to test with');
    return;
  }

  try {
    const response = await fetch(`https://${process.env.RAPIDAPI_HOST}/get-linkedin-profile?linkedin_url=${encodeURIComponent(testUrl)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': testKey.key,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
      }
    });

    console.log(`   Response status: ${response.status}`);
    console.log(`   Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ API call failed: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`   ✅ API call successful!`);
    console.log(`   Response data keys: ${Object.keys(data).join(', ')}`);
    
  } catch (error) {
    console.log(`   ❌ API call error: ${error.message}`);
  }
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
