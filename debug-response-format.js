const axios = require('axios');

async function debugLinkedInResponse() {
  console.log('🔍 Debugging LinkedIn API response format...');

  const api_key = '68878f54f5cc644b92ec13d6';
  const url = 'https://api.scrapingdog.com/linkedin';

  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: 'musayevcreate',
    premium: 'false',
  };

  try {
    const response = await axios.get(url, { params: params });

    if (response.status === 200) {
      console.log('✅ API Response received');
      console.log('📦 Full response data:');
      console.log(JSON.stringify(response.data, null, 2));

      console.log('\n🔍 Response analysis:');
      console.log('- Response type:', typeof response.data);
      console.log('- Is array:', Array.isArray(response.data));
      console.log('- Object keys:', Object.keys(response.data));

      // Check if data is nested
      if (response.data.data) {
        console.log('\n📋 Nested data found:');
        console.log(JSON.stringify(response.data.data, null, 2));
      }

    } else {
      console.log('❌ Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

debugLinkedInResponse();
