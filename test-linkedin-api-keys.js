const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkLinkedInAPI() {
  try {
    console.log('🔍 LinkedIn API key-ləri yoxlayır...');
    
    // Get all API keys
    const keys = await prisma.apiKey.findMany({
      where: { 
        active: true,
        service: 'linkedin'
      },
      orderBy: { priority: 'desc' }
    });
    
    console.log(`📋 Aktiv LinkedIn API key-lər: ${keys.length} ədəd`);
    console.log('=====================================');
    
    if (keys.length === 0) {
      console.log('⚠️  Heç bir aktiv LinkedIn API key tapılmadı');
      return;
    }
    
    // Test each API key
    const rapidApiHost = process.env.RAPIDAPI_HOST || 'fresh-linkedin-profile-data.p.rapidapi.com';
    const testUrl = `https://${rapidApiHost}/get-linkedin-profile?linkedin_url=https://www.linkedin.com/in/test`;
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      console.log(`\n${i + 1}. API Key: ${key.key.substring(0, 15)}...${key.key.substring(key.key.length - 5)}`);
      console.log(`   Priority: ${key.priority}`);
      console.log(`   Usage Count: ${key.usageCount}`);
      console.log(`   Last Used: ${key.lastUsed || 'Never'}`);
      console.log(`   Last Result: ${key.lastResult || 'None'}`);
      
      try {
        const response = await axios.get(testUrl, {
          headers: {
            'X-RapidAPI-Key': key.key,
            'X-RapidAPI-Host': rapidApiHost,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });
        
        console.log(`   ✅ Status: ${response.status} - Key işləyir`);
        
      } catch (error) {
        if (error.response) {
          console.log(`   ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
          if (error.response.status === 404) {
            console.log(`   🔍 404 - Endpoint tapılmadı və ya profile mövcud deyil`);
          } else if (error.response.status === 429) {
            console.log(`   ⏱️ 429 - Rate limit aşıldı`);
          } else if (error.response.status === 401 || error.response.status === 403) {
            console.log(`   🚫 ${error.response.status} - API key problemi`);
          }
        } else {
          console.log(`   ❌ Şəbəkə xətası: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔧 Environment Variables:');
    console.log(`   RAPIDAPI_HOST: ${process.env.RAPIDAPI_HOST || 'NOT SET'}`);
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLinkedInAPI();
