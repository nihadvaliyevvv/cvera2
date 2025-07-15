#!/usr/bin/env node

// Test script to diagnose LinkedIn import issues
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function diagnoseLinkediImportIssues() {
  console.log('=== LinkedIn Import Diagnostic Test ===\n');
  
  // 1. Check API keys in database
  console.log('1. Checking API keys in database...');
  const apiKeys = await prisma.apiKey.findMany({
    where: { service: 'linkedin' },
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      usageCount: true,
      lastUsed: true,
      lastResult: true,
      deactivatedAt: true
    },
    orderBy: { priority: 'asc' }
  });
  
  console.log(`   Found ${apiKeys.length} LinkedIn API keys:`);
  apiKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.name}`);
    console.log(`      Status: ${key.active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`      Usage: ${key.usageCount} times`);
    console.log(`      Last Result: ${key.lastResult || 'Never used'}`);
    console.log(`      Last Used: ${key.lastUsed ? key.lastUsed.toISOString() : 'Never'}`);
    console.log(`      Deactivated: ${key.deactivatedAt ? key.deactivatedAt.toISOString() : 'Never'}`);
    console.log(`      Key: ${key.key.substring(0, 20)}...`);
    console.log('');
  });
  
  if (apiKeys.length === 0) {
    console.log('   ❌ No LinkedIn API keys found in database!');
    console.log('   💡 Add API keys through admin panel or run migration script');
    return;
  }
  
  const activeKeys = apiKeys.filter(k => k.active);
  console.log(`   Active keys: ${activeKeys.length}/${apiKeys.length}`);
  
  if (activeKeys.length === 0) {
    console.log('   ❌ No active LinkedIn API keys!');
    console.log('   💡 Reactivate keys through admin panel or wait for auto-reactivation');
    return;
  }
  
  // 2. Check environment variables
  console.log('2. Checking environment variables...');
  const requiredEnvVars = {
    'RAPIDAPI_HOST': process.env.RAPIDAPI_HOST,
    'JWT_SECRET': process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    'DATABASE_URL': process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'
  };
  
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  
  if (!process.env.RAPIDAPI_HOST) {
    console.log('   ❌ RAPIDAPI_HOST is missing!');
    return;
  }
  
  // 3. Test API key directly with RapidAPI
  console.log('\n3. Testing API key directly with RapidAPI...');
  const testKey = activeKeys[0];
  const testUrl = 'https://www.linkedin.com/in/satyanadella';
  
  try {
    console.log(`   Testing with key: ${testKey.key.substring(0, 20)}...`);
    console.log(`   Test URL: ${testUrl}`);
    console.log(`   RapidAPI Host: ${process.env.RAPIDAPI_HOST}`);
    
    const response = await axios.get(
      `https://${process.env.RAPIDAPI_HOST}/get-linkedin-profile`,
      {
        params: { linkedin_url: testUrl },
        headers: {
          "X-RapidAPI-Key": testKey.key,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
        },
        timeout: 30000
      }
    );
    
    console.log(`   ✅ API call successful! Status: ${response.status}`);
    console.log(`   Response data keys: ${Object.keys(response.data || {}).join(', ')}`);
    
    if (response.data && response.data.full_name) {
      console.log(`   Profile found: ${response.data.full_name}`);
    } else {
      console.log('   ⚠️  Response structure unexpected');
      console.log('   Raw response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    }
    
  } catch (error) {
    console.log(`   ❌ API call failed:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      code: error.code
    });
    
    if (error.response?.status === 401) {
      console.log('   💡 API key might be invalid or expired');
    } else if (error.response?.status === 429) {
      console.log('   💡 Rate limit exceeded');
    } else if (error.response?.status === 404) {
      console.log('   💡 Profile not found or API endpoint changed');
    }
  }
  
  // 4. Test the LinkedIn import endpoint
  console.log('\n4. Testing LinkedIn import endpoint...');
  
  // First, create a test user token
  const testUser = await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  });
  
  if (!testUser) {
    console.log('   ❌ Test user not found, creating one...');
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123'
      }
    });
    console.log(`   ✅ Created test user: ${newUser.email}`);
  }
  
  // Create a test JWT token
  const jwt = require('jsonwebtoken');
  const testToken = jwt.sign(
    { userId: testUser?.id || 'test-user-id' },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '1h' }
  );
  
  try {
    console.log('   Testing LinkedIn import API endpoint...');
    const response = await axios.post(
      'http://localhost:3000/api/import/linkedin',
      {
        url: testUrl
      },
      {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log(`   ✅ Import endpoint successful! Status: ${response.status}`);
    console.log(`   Response keys: ${Object.keys(response.data || {}).join(', ')}`);
    
    if (response.data && response.data.full_name) {
      console.log(`   Imported profile: ${response.data.full_name}`);
    } else {
      console.log('   ⚠️  Import response structure unexpected');
    }
    
  } catch (error) {
    console.log(`   ❌ Import endpoint failed:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Server is not running on localhost:3000');
    }
  }
  
  // 5. Summary and recommendations
  console.log('\n=== Diagnostic Summary ===');
  const activeKeysCount = activeKeys.length;
  const totalKeysCount = apiKeys.length;
  
  if (activeKeysCount === 0) {
    console.log('❌ CRITICAL: No active API keys');
    console.log('💡 Solutions:');
    console.log('   1. Add new API keys through admin panel');
    console.log('   2. Reactivate existing keys');
    console.log('   3. Wait for auto-reactivation (30 days)');
  } else if (activeKeysCount < totalKeysCount) {
    console.log(`⚠️  WARNING: Only ${activeKeysCount}/${totalKeysCount} keys active`);
    console.log('💡 Consider reactivating deactivated keys');
  } else {
    console.log(`✅ ${activeKeysCount} active API keys available`);
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Ensure server is running: npm run dev');
  console.log('2. Check admin panel: http://localhost:3000/error/api-keys');
  console.log('3. Test import manually: Frontend → LinkedIn Import');
  console.log('4. Monitor logs during import attempts');
}

diagnoseLinkediImportIssues()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
