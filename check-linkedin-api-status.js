#!/usr/bin/env node

// LinkedIn API Status Check - Database Version
const dotenv = require('dotenv');
dotenv.config();

async function checkApiStatus() {
  console.log('🔍 LinkedIn Import API Status Check (Database API Keys)\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'GET'
    });
    
    const data = await response.json();
    
    console.log('📊 API Status:', data.message);
    console.log('🔢 Version:', data.version);
    
    if (data.configuration?.databaseApiKeys) {
      const apiKeys = data.configuration.databaseApiKeys;
      console.log('⚙️  Database Configuration:');
      console.log(`   RapidAPI Host: ${data.configuration?.rapidApiHost || 'Unknown'}`);
      console.log(`   Total API Keys: ${apiKeys.total}`);
      console.log(`   Active API Keys: ${apiKeys.active}`);
      
      if (apiKeys.keys && apiKeys.keys.length > 0) {
        console.log('   Configured Keys:');
        apiKeys.keys.forEach((key, index) => {
          console.log(`     ${index + 1}. ${key.name} (Priority: ${key.priority}, ID: ${key.id})`);
        });
      }
    }
    
    console.log('\n🎁 Features:');
    data.features?.forEach(feature => console.log(`   • ${feature}`));
    
    if (data.status !== 'ready') {
      console.log('\n⚠️  WARNING: API not ready!');
      if (data.status === 'no_api_keys') {
        console.log('   No active API keys found in database');
        console.log('   Add LinkedIn API keys through admin panel at /error/api-keys');
      }
    } else {
      console.log('\n✅ API Ready for real LinkedIn data import');
      console.log('   API keys are managed through admin panel');
    }
    
  } catch (error) {
    console.error('💥 Error checking API status:', error.message);
    console.log('\n💡 Make sure Next.js dev server is running: npm run dev');
  }
}

checkApiStatus();
