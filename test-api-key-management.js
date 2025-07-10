#!/usr/bin/env node

// Test script to demonstrate API key management
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testApiKeyManagement() {
  console.log('=== API Key Management Test ===\n');
  
  // 1. Show current API keys in database
  console.log('1. Current API keys in database:');
  const dbKeys = await prisma.apiKey.findMany({
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      priority: true,
      createdAt: true
    },
    orderBy: { priority: 'asc' }
  });
  
  dbKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.name} - ${key.key.substring(0, 20)}... (${key.active ? 'Active' : 'Inactive'})`);
  });
  console.log(`   Total: ${dbKeys.length} keys\n`);
  
  // 2. Show what's in .env.local
  console.log('2. API keys in .env.local:');
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const envKeys = [];
  for (let i = 1; i <= 10; i++) {
    const match = envContent.match(new RegExp(`RAPIDAPI_KEY_${i}=([^\\n]+)`));
    if (match) {
      envKeys.push({ name: `RAPIDAPI_KEY_${i}`, value: match[1] });
    }
  }
  
  envKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.name}=${key.value.substring(0, 20)}...`);
  });
  console.log(`   Total: ${envKeys.length} keys\n`);
  
  // 3. Add a new API key via database (simulating admin panel)
  console.log('3. Adding new API key via database (simulating admin panel):');
  const newApiKey = {
    name: 'LinkedIn API Key 6 (Admin Added)',
    key: 'new-test-key-12345678901234567890abcdef',
    service: 'linkedin',
    priority: 6,
    active: true
  };
  
  try {
    const createdKey = await prisma.apiKey.create({
      data: newApiKey
    });
    console.log(`   ✓ Added: ${createdKey.name}`);
    console.log(`   ✓ Key ID: ${createdKey.id}`);
    console.log(`   ✓ Key: ${createdKey.key.substring(0, 20)}...`);
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }
  
  // 4. Check if new key appears in .env.local
  console.log('\n4. Checking if new key appears in .env.local:');
  const updatedEnvContent = fs.readFileSync(envPath, 'utf8');
  const hasNewKey = updatedEnvContent.includes(newApiKey.key);
  console.log(`   New key in .env.local: ${hasNewKey ? 'YES' : 'NO'}`);
  
  // 5. Show updated database state
  console.log('\n5. Updated database state:');
  const updatedDbKeys = await prisma.apiKey.findMany({
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      priority: true,
      createdAt: true
    },
    orderBy: { priority: 'asc' }
  });
  
  updatedDbKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${key.name} - ${key.key.substring(0, 20)}... (${key.active ? 'Active' : 'Inactive'})`);
  });
  console.log(`   Total: ${updatedDbKeys.length} keys\n`);
  
  // 6. Clean up test key
  console.log('6. Cleaning up test key:');
  try {
    await prisma.apiKey.deleteMany({
      where: { name: 'LinkedIn API Key 6 (Admin Added)' }
    });
    console.log('   ✓ Test key cleaned up');
  } catch (error) {
    console.log(`   ✗ Cleanup error: ${error.message}`);
  }
  
  console.log('\n=== Summary ===');
  console.log('• Admin panel manages API keys in DATABASE only');
  console.log('• Changes in admin panel DO NOT affect .env.local file');
  console.log('• LinkedIn import uses ONLY database-managed keys');
  console.log('• .env.local keys are imported once via migration script');
  console.log('• After migration, .env.local keys can be removed if desired');
}

testApiKeyManagement()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
