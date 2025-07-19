const axios = require('axios');

async function testDifferentLinkedInHosts() {
  console.log('🔍 Fərqli LinkedIn API host-larını test edirik...');
  
  const apiKey = '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d';
  const testUrl = 'https://www.linkedin.com/in/johnsmith';
  
  // Popular LinkedIn API hosts on RapidAPI
  const hosts = [
    'linkedin-api8.p.rapidapi.com',
    'linkedin-data-api.p.rapidapi.com', 
    'fresh-linkedin-profile-data.p.rapidapi.com',
    'linkedin-profile-data.p.rapidapi.com',
    'linkedin-scraper-api.p.rapidapi.com',
    'linkedin48.p.rapidapi.com',
    'linkedin-profiles1.p.rapidapi.com',
    'linkedin-data-scraper.p.rapidapi.com'
  ];
  
  for (const host of hosts) {
    console.log(`\n🌐 Testing host: ${host}`);
    
    // Test root endpoint
    try {
      const response = await axios.get(`https://${host}/`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host
        },
        params: {
          url: testUrl
        },
        timeout: 5000
      });
      
      console.log(`✅ SUCCESS on ${host}:`, response.status);
      console.log('📊 Data sample:', JSON.stringify(response.data).substring(0, 200));
      return; // Stop on first success
      
    } catch (error) {
      const status = error.response?.status;
      console.log(`❌ ${host}: ${status || error.message}`);
      
      if (status === 403) {
        console.log('   💡 API key works but service needs subscription');
      } else if (status === 401) {
        console.log('   💡 API key invalid for this service');
      } else if (status === 404) {
        console.log('   💡 Endpoint not found');
      } else if (status === 429) {
        console.log('   💡 Rate limit exceeded');
      }
    }
  }
  
  console.log('\n❌ Heç bir host işləmədi');
}

testDifferentLinkedInHosts();
