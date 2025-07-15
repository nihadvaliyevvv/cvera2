// Simple LinkedIn import test
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
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
  console.log('=== Simple LinkedIn Import Test ===\n');

  try {
    // 1. Check environment
    console.log('1. Environment check:');
    console.log(`   RAPIDAPI_HOST: ${process.env.RAPIDAPI_HOST}`);
    console.log(`   Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
    
    if (!process.env.RAPIDAPI_HOST) {
      console.log('   ❌ RAPIDAPI_HOST missing!');
      return;
    }

    // 2. Check API keys
    console.log('\n2. API Keys check:');
    const apiKeys = await prisma.apiKey.findMany({
      where: { service: 'linkedin' }
    });
    
    console.log(`   Found ${apiKeys.length} LinkedIn API keys`);
    
    const activeKeys = apiKeys.filter(key => key.active);
    console.log(`   Active keys: ${activeKeys.length}`);
    
    if (activeKeys.length === 0) {
      console.log('   ❌ No active API keys found!');
      return;
    }

    // 3. Test API call
    console.log('\n3. Testing API call:');
    const testKey = activeKeys[0];
    console.log(`   Using key: ${testKey.name}`);
    
    const testUrl = 'https://linkedin.com/in/satyanadella';
    
    const response = await fetch(`https://${process.env.RAPIDAPI_HOST}/get-linkedin-profile`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': testKey.key,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
        'url': testUrl
      }
    });

    console.log(`   Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`   ✅ Success! Data keys: ${Object.keys(data).join(', ')}`);
    
    if (data.name) {
      console.log(`   Name: ${data.name}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

testLinkedInImport().catch(console.error);
