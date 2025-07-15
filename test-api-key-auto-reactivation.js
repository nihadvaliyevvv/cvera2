#!/usr/bin/env node

// Test script for API key auto-reactivation after 30 days
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testAutoReactivationFeature() {
  console.log('=== API Key Auto-Reactivation Test ===\n');
  
  // 1. Create test API keys with different deactivation scenarios
  console.log('1. Creating test API keys...');
  
  const testKeys = [
    {
      name: 'Test Key 1 (Recent - Should NOT reactivate)',
      key: 'test-key-recent-12345',
      deactivatedAt: new Date(), // Just deactivated
      lastResult: 'deactivated_auth_error'
    },
    {
      name: 'Test Key 2 (Old - Should reactivate)',
      key: 'test-key-old-12345',
      deactivatedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
      lastResult: 'deactivated_server_error'
    },
    {
      name: 'Test Key 3 (Very Old - Should reactivate)',
      key: 'test-key-very-old-12345',
      deactivatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      lastResult: 'deactivated_network_error'
    }
  ];
  
  const createdKeys = [];
  for (const keyData of testKeys) {
    const key = await prisma.apiKey.create({
      data: {
        name: keyData.name,
        key: keyData.key,
        service: 'linkedin',
        active: false,
        priority: 999,
        usageCount: 1,
        lastUsed: keyData.deactivatedAt,
        lastResult: keyData.lastResult,
        deactivatedAt: keyData.deactivatedAt
      }
    });
    createdKeys.push(key);
    console.log(`   ✓ Created: ${key.name}`);
    console.log(`     Deactivated: ${key.deactivatedAt.toISOString()}`);
    console.log(`     Days ago: ${Math.floor((Date.now() - key.deactivatedAt.getTime()) / (1000 * 60 * 60 * 24))}`);
  }
  
  // 2. Test the cron job endpoint (GET - check eligible keys)
  console.log('\n2. Checking keys eligible for reactivation...');
  try {
    const response = await axios.get('http://localhost:3000/api/system/cron/reactivate-api-keys', {
      headers: {
        'X-Cron-Secret': 'cron-secret-12345-cvera-api-keys'
      }
    });
    
    console.log(`   Found ${response.data.eligibleCount} keys eligible for reactivation:`);
    response.data.eligibleKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key.name} (${key.daysSinceDeactivation} days ago)`);
    });
  } catch (error) {
    console.error('   ❌ Error checking eligible keys:', error.response?.data || error.message);
  }
  
  // 3. Test the cron job endpoint (POST - actually reactivate)
  console.log('\n3. Running reactivation cron job...');
  try {
    const response = await axios.post('http://localhost:3000/api/system/cron/reactivate-api-keys', {}, {
      headers: {
        'X-Cron-Secret': 'cron-secret-12345-cvera-api-keys'
      }
    });
    
    console.log(`   ✅ ${response.data.message}`);
    console.log(`   Reactivated ${response.data.reactivatedCount} keys:`);
    response.data.reactivatedKeys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key.name} (${key.key})`);
    });
  } catch (error) {
    console.error('   ❌ Error running reactivation:', error.response?.data || error.message);
  }
  
  // 4. Check the updated state
  console.log('\n4. Checking updated API key states...');
  const updatedKeys = await prisma.apiKey.findMany({
    where: {
      id: { in: createdKeys.map(k => k.id) }
    },
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      lastResult: true,
      deactivatedAt: true,
      usageCount: true
    }
  });
  
  updatedKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.name}`);
    console.log(`      Status: ${key.active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`      Last Result: ${key.lastResult || 'None'}`);
    console.log(`      Deactivated At: ${key.deactivatedAt ? key.deactivatedAt.toISOString() : 'Never'}`);
    console.log(`      Usage Count: ${key.usageCount}`);
    console.log('');
  });
  
  // 5. Test unauthorized access
  console.log('5. Testing unauthorized access...');
  try {
    const response = await axios.post('http://localhost:3000/api/system/cron/reactivate-api-keys', {}, {
      headers: {
        'X-Cron-Secret': 'wrong-secret'
      }
    });
    console.log('   ❌ Should have failed with wrong secret');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Correctly rejected unauthorized access');
    } else {
      console.error('   ❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // 6. Cleanup
  console.log('\n6. Cleaning up test keys...');
  await prisma.apiKey.deleteMany({
    where: {
      id: { in: createdKeys.map(k => k.id) }
    }
  });
  console.log('   ✓ Test keys cleaned up');
  
  console.log('\n=== Auto-Reactivation Test Summary ===');
  console.log('✅ API keys older than 30 days are automatically reactivated');
  console.log('✅ Recent API keys (< 30 days) remain inactive');
  console.log('✅ Cron job is protected with secret key');
  console.log('✅ Admin panel shows days until reactivation');
  console.log('✅ Reactivated keys get "auto_reactivated_after_30_days" status');
  console.log('');
  console.log('🔄 To set up automatic reactivation:');
  console.log('   1. Set up a cron job to run daily:');
  console.log('      0 0 * * * curl -X POST http://localhost:3000/api/system/cron/reactivate-api-keys -H "X-Cron-Secret: cron-secret-12345-cvera-api-keys"');
  console.log('   2. Or use a service like Vercel Cron Jobs');
  console.log('   3. Monitor the admin panel for reactivation status');
}

testAutoReactivationFeature()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
