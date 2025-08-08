const axios = require('axios');

async function testKhalidProfile() {
  console.log('🔍 Testing khalidbabasoy profile with your API key...');

  const api_key = '68878f54f5cc644b92ec13d6';
  const url = 'https://api.scrapingdog.com/linkedin';

  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: 'khalidbabasoy',
    premium: 'false',
  };

  try {
    const response = await axios.get(url, { params: params });

    if (response.status === 200) {
      const data = response.data;
      console.log('✅ API Response successful');
      console.log('📦 Full response:');
      console.log(JSON.stringify(data, null, 2));

      // Check if it's an array or object
      if (Array.isArray(data)) {
        console.log('\n🔍 Array response detected, checking first element:');
        if (data.length > 0) {
          const profile = data[0];
          console.log('👤 Name:', profile.first_name, profile.last_name);
          console.log('🎯 Headline:', profile.headline);
          console.log('📍 Location:', profile.location);
          console.log('📝 About:', profile.about?.substring(0, 100) + '...');
          console.log('💼 Experience count:', profile.experience?.length || 0);
          console.log('🎓 Education count:', profile.education?.length || 0);
          console.log('📋 Projects count:', profile.projects?.length || 0);
          console.log('🏆 Awards count:', profile.awards?.length || 0);
        } else {
          console.log('❌ Array is empty');
        }
      } else {
        console.log('\n🔍 Object response detected:');
        console.log('👤 Name:', data.first_name, data.last_name);
        console.log('🎯 Headline:', data.headline);
        console.log('📍 Location:', data.location);
      }

    } else {
      console.log('❌ Request failed with status code: ' + response.status);
    }
  } catch (error) {
    console.error('❌ Error making the request:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

testKhalidProfile();
