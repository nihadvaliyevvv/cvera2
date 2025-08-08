const axios = require('axios');

async function testWithNewApiKey() {
  console.log('🧪 Testing with fresh API key from database: 68878f54***');

  const api_key = '68878f54f5cc644b92ec13d6';
  const url = 'https://api.scrapingdog.com/linkedin';

  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: 'khalidbabasoy',
    premium: 'false',
  };

  try {
    console.log('📡 Making request with fresh API key...');

    const response = await axios.get(url, {
      params: params,
      timeout: 30000,
      headers: {
        'User-Agent': 'CVERA-LinkedIn-Scraper/2.0'
      }
    });

    if (response.status === 200) {
      console.log('✅ SUCCESS! Profile scraped successfully');
      console.log('📊 Response status:', response.status);
      console.log('📦 Data received:', !!response.data);
      console.log('👤 Name:', response.data?.first_name, response.data?.last_name);
      console.log('🎯 Headline:', response.data?.headline?.substring(0, 50) + '...');
      console.log('📍 Location:', response.data?.location);
      console.log('💼 Experience count:', response.data?.experience?.length || 0);
      console.log('🎓 Education count:', response.data?.education?.length || 0);
      console.log('🔧 Skills found:', response.data?.skills?.length || 0);

      console.log('\n🎉 LinkedIn import artıq çalışır! Production-da test edə bilərsiniz.');
    }

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('- Status:', error.response?.status);
    console.error('- Message:', error.message);
    console.error('- Response:', JSON.stringify(error.response?.data, null, 2));

    if (error.response?.status === 400) {
      console.log('\n🔍 400 Error Analysis:');
      console.log('- API key yoxlanmalıdır');
      console.log('- LinkedIn username formatı düzgün olmalıdır');
      console.log('- API parametrləri yoxlanmalıdır');
    } else if (error.response?.status === 403) {
      console.log('\n🔍 403 Error - API limit bitib və ya API key etibarsızdır');
    }
  }
}

testWithNewApiKey();
