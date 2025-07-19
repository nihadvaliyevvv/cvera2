const axios = require('axios');

async function testLinkedInEndpoint() {
  // Test with one of the API keys from .env.local or directly
  const testApiKeys = [
    '926bdaf2b5msh07c3dbc0de1ed0bp1962a9jsn64d22ea03901',
    'de58c5f1bamshf47324c2cc9c2dap1b234djsnba3fd24e8b35',
    'f6c8e9e2a7mshb4e9d2f8f7e6c5b4a3djsn1234567890ab',
    '8a7b6c5d4e3f2g1h0i9j8k7l6m5n4o3p2q1r0s9t8u7v6w5x',
    '1q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0z1x2c3v4b'
  ];
  
  const host = 'fresh-linkedin-profile-data.p.rapidapi.com';
  const testUrl = `https://${host}/get-linkedin-profile`;
  
  console.log('🔍 LinkedIn API endpoint-ini test edir...');
  console.log(`📡 Host: ${host}`);
  console.log(`📍 URL: ${testUrl}`);
  console.log(`🔑 ${testApiKeys.length} API key test ediləcək`);
  
  for (let i = 0; i < testApiKeys.length; i++) {
    const apiKey = testApiKeys[i];
    console.log(`\n${i + 1}. API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    
    try {
      const response = await axios.get(testUrl, {
        params: {
          linkedin_url: 'https://www.linkedin.com/in/test'
        },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000
      });
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Response type: ${typeof response.data}`);
      console.log(`   📏 Response size: ${JSON.stringify(response.data).length} chars`);
      
      if (response.data && typeof response.data === 'object') {
        console.log(`   🔍 Response keys: ${Object.keys(response.data).join(', ')}`);
      }
      
      // If successful, we found a working key
      if (response.status === 200) {
        console.log(`   🎉 Bu API key işləyir!`);
        break;
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ HTTP ${error.response.status}: ${error.response.statusText}`);
        
        if (error.response.status === 404) {
          console.log(`   🚫 404 - Endpoint mövcud deyil və ya LinkedIn profile tapılmadı`);
        } else if (error.response.status === 429) {
          console.log(`   ⏱️ 429 - Rate limit aşıldı, 1 saniyə gözlə`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (error.response.status === 401) {
          console.log(`   🔑 401 - API key yanlış və ya unauthorised`);
        } else if (error.response.status === 403) {
          console.log(`   🚫 403 - API key-ə icazə verilməyib`);
        } else if (error.response.status === 500) {
          console.log(`   💥 500 - Server xətası`);
        }
        
        // Show response body for debugging
        if (error.response.data && typeof error.response.data === 'object') {
          console.log(`   📄 Error details:`, JSON.stringify(error.response.data).substring(0, 200));
        }
        
      } else if (error.code === 'ECONNABORTED') {
        console.log(`   ⏰ Timeout - API cavab vermədi`);
      } else {
        console.log(`   ❌ Şəbəkə xətası: ${error.message}`);
      }
    }
    
    // Wait between requests to avoid rate limiting
    if (i < testApiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n🔧 Tövsiyələr:');
  console.log('1. Əgər həqiqi LinkedIn profile URL istifadə edirsinizsə, profili yoxlayın');
  console.log('2. Yeni API key-lər RapidAPI-dan alın');
  console.log('3. Endpoint-in doğru olduğunu yoxlayın');
}

testLinkedInEndpoint().catch(console.error);
