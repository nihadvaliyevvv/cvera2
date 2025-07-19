const axios = require('axios');

async function testRapidApiDirectly() {
  console.log('🔍 RapidAPI-da mövcud endpoint-ləri test edirik...');
  
  const apiKey = '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d';
  const host = 'fresh-linkedin-profile-data.p.rapidapi.com';
  const testUrl = 'https://www.linkedin.com/in/johnsmith';
  
  // Try different possible endpoints
  const endpoints = [
    '/',
    '/api',
    '/v1',
    '/get-profile',
    '/profile',
    '/linkedin',
    '/scrape'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Testing: https://${host}${endpoint}`);
      
      const response = await axios.get(`https://${host}${endpoint}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host
        },
        params: {
          url: testUrl
        },
        timeout: 5000
      });
      
      console.log(`✅ SUCCESS ${endpoint}:`, response.status);
      console.log('📊 Data keys:', Object.keys(response.data));
      break;
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
      
      if (error.response?.status === 403) {
        console.log('💡 403 - API subscription problemi');
      } else if (error.response?.status === 429) {
        console.log('💡 429 - Rate limit');
      }
    }
  }
}

testRapidApiDirectly();
