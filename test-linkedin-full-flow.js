#!/usr/bin/env node

// Test LinkedIn import full flow
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

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

async function testLinkedInImport() {
  console.log('=== Testing LinkedIn Import Full Flow ===\n');

  // 1. Get a real user from database
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ No user found in database');
    return;
  }

  console.log('Found user:', user.email || user.id);
  
  // Create a test user token
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  
  console.log('1. Testing LinkedIn import API...');
  
  try {
    // Test LinkedIn import
    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.linkedin.com/in/sample-profile'
      })
    });

    const result = await response.json();
    console.log('   Response status:', response.status);
    console.log('   Response data:', JSON.stringify(result, null, 2));

    if (result.success && result.sessionId) {
      console.log('\n2. Testing session retrieval...');
      
      // Test session retrieval
      const sessionResponse = await fetch(`http://localhost:3000/api/import/session?session=${result.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const sessionResult = await sessionResponse.json();
      console.log('   Session response status:', sessionResponse.status);
      console.log('   Session data keys:', Object.keys(sessionResult.data || {}));
      
      if (sessionResult.success) {
        console.log('   ✅ Session data loaded successfully!');
        console.log('   Personal info:', sessionResult.data.personal_info);
        console.log('   Experience count:', sessionResult.data.experience?.length || 0);
        console.log('   Education count:', sessionResult.data.education?.length || 0);
        console.log('   Skills count:', sessionResult.data.skills?.length || 0);
      } else {
        console.log('   ❌ Session loading failed:', sessionResult.error);
      }
    }
    
  } catch (error) {
    console.error('   ❌ Test failed:', error.message);
  }
}

testLinkedInImport()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
