#!/usr/bin/env node

// LinkedIn Import API Test Script - Database Version
// Bu script API-nin mock data vermədən həqiqi data gətirdiyini yoxlayır

const dotenv = require('dotenv');
dotenv.config();

async function testLinkedInImport() {
  console.log('🧪 LinkedIn Import API Test (Database API Keys)\n');
  
  // Check status first
  console.log('📋 API Status Check:');
  try {
    const statusResponse = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'GET'
    });
    const statusData = await statusResponse.json();
    
    if (statusData.configuration?.databaseApiKeys) {
      const apiKeys = statusData.configuration.databaseApiKeys;
      console.log(`   Database API Keys: ${apiKeys.total} total, ${apiKeys.active} active`);
      
      if (apiKeys.total === 0) {
        console.log('   ❌ No API keys found in database!');
        console.log('   💡 Add API keys through admin panel at /error/api-keys');
        return;
      }
    }
  } catch (error) {
    console.log('   ❌ Could not check status');
  }
  console.log('');
  
  const testUrl = 'https://www.linkedin.com/in/test-profile';
  
  try {
    console.log('🚀 Testing LinkedIn import with:', testUrl);
    
    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success || false}`);
    
    if (data.success) {
      console.log('✅ SUCCESS: Real data imported from database-managed API keys');
      console.log('📋 Imported data:', {
        name: data.data?.personalInfo?.name,
        experience_count: data.data?.experience?.length || 0,
        education_count: data.data?.education?.length || 0
      });
    } else {
      console.log('❌ FAILED:', data.error);
      
      // Provide specific guidance based on error
      if (data.error.includes('admin panelində')) {
        console.log('\n💡 Solution: Add API keys through admin panel');
        console.log('   1. Go to admin panel at /error/api-keys');
        console.log('   2. Add your RapidAPI keys for LinkedIn service');
        console.log('   3. Make sure keys are set to active');
      } else if (data.error.includes('public')) {
        console.log('\n💡 Solution: Use a public LinkedIn profile URL');
      }
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
    console.log('\n💡 Make sure Next.js dev server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testLinkedInImport();
