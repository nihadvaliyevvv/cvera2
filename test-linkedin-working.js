const axios = require('axios');

async function testLinkedInImport() {
  console.log('🔍 Testing LinkedIn import with your API key...');

  // Your provided API key
  const api_key = '68878f54f5cc644b92ec13d6';
  const url = 'https://api.scrapingdog.com/linkedin';

  // Test with both profiles
  const profiles = ['musayevcreate', 'khalidbabasoy'];

  for (const profile of profiles) {
    console.log(`\n📋 Testing profile: ${profile}`);

    const params = {
      api_key: api_key,
      type: 'profile',
      linkId: profile,
      premium: 'false',
    };

    try {
      const response = await axios.get(url, {
        params: params,
        timeout: 30000
      });

      if (response.status === 200) {
        const data = response.data;
        console.log('✅ SUCCESS!');
        console.log('👤 Name:', data.first_name, data.last_name);
        console.log('🎯 Headline:', data.headline?.substring(0, 50) + '...');
        console.log('📍 Location:', data.location);
        console.log('💼 Experience:', data.experience?.length || 0, 'entries');
        console.log('🎓 Education:', data.education?.length || 0, 'entries');
        console.log('🔧 Skills:', data.skills?.length || 0, 'skills');
        console.log('📝 Summary available:', !!data.summary || !!data.about);

        // Show first few skills if available
        if (data.skills && data.skills.length > 0) {
          console.log('📋 Sample skills:', data.skills.slice(0, 5).join(', '));
        }

        console.log('✅ LinkedIn import working for:', profile);
      } else {
        console.log('❌ Request failed with status code:', response.status);
      }
    } catch (error) {
      console.error(`❌ Error for ${profile}:`, error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testLinkedInImport();
