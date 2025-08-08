const axios = require('axios');

async function testHybridApproach() {
  console.log('🧪 Testing hybrid approach: ScrapingDog + RapidAPI');

  // Test 1: ScrapingDog for main profile data
  console.log('\n1️⃣ Testing ScrapingDog API for main data...');
  try {
    const scrapingDogResponse = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: '6882894b855f5678d36484c8',
        type: 'profile',
        linkId: 'khalidbabasoy',
        premium: 'false',
      },
      timeout: 30000
    });

    console.log('✅ ScrapingDog Success!');
    console.log('📊 Status:', scrapingDogResponse.status);
    console.log('👤 Name:', scrapingDogResponse.data?.first_name, scrapingDogResponse.data?.last_name);
    console.log('🎯 Headline:', scrapingDogResponse.data?.headline);
    console.log('📍 Location:', scrapingDogResponse.data?.location);

  } catch (error) {
    console.log('❌ ScrapingDog failed:', error.response?.status, error.message);
  }

  // Test 2: RapidAPI for skills
  console.log('\n2️⃣ Testing RapidAPI for skills...');
  try {
    const rapidApiResponse = await axios.get('https://fresh-linkedin-profile-data.p.rapidapi.com/get-extra-profile-data', {
      params: {
        linkedin_url: 'https://www.linkedin.com/in/khalidbabasoy'
      },
      headers: {
        'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
        'x-rapidapi-key': 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4'
      },
      timeout: 15000
    });

    console.log('✅ RapidAPI Success!');
    console.log('📊 Status:', rapidApiResponse.status);
    console.log('🔧 Skills data:', rapidApiResponse.data?.data?.skills || 'No skills found');

  } catch (error) {
    console.log('❌ RapidAPI failed:', error.response?.status, error.message);
  }

  console.log('\n🎯 Hybrid approach test completed!');
}

testHybridApproach();
