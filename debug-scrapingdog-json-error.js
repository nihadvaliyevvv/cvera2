const axios = require('axios');

async function debugScrapingDogAPI() {
  console.log('🔍 ScrapingDog API Debug Test');
  console.log('================================');

  const api_key = '6882894b855f5678d36484c8';
  const url = 'https://api.scrapingdog.com/linkedin';

  const params = {
    api_key: api_key,
    type: 'profile',
    linkId: 'musayevcreate',
    premium: 'false',
  };

  try {
    console.log('📡 Making request to ScrapingDog...');
    console.log('URL:', url);
    console.log('Params:', params);
    console.log('');

    const response = await axios.get(url, {
      params: params,
      timeout: 30000, // 30 second timeout
      validateStatus: false // Don't throw for any status code
    });

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Headers:', response.headers);
    console.log('');

    // Check content type
    const contentType = response.headers['content-type'];
    console.log('📄 Content Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      console.log('✅ JSON Response received:');
      console.log(JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Non-JSON Response received:');
      console.log('Response data (first 500 chars):');
      console.log(response.data.toString().substring(0, 500));

      // Check if it's an error page
      if (response.data.toString().includes('<!DOCTYPE')) {
        console.log('');
        console.log('🚨 Received HTML page instead of JSON');
        console.log('This usually means:');
        console.log('1. Invalid API key');
        console.log('2. Incorrect endpoint URL');
        console.log('3. API service is down');
        console.log('4. Rate limit exceeded');
      }
    }

    // Test API key validity
    console.log('');
    console.log('🔑 Testing API key validity...');

    const testResponse = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: api_key,
        type: 'profile',
        linkId: 'elon-musk', // Well-known profile
        premium: 'false'
      },
      timeout: 30000,
      validateStatus: false
    });

    console.log('Test Status:', testResponse.status);
    if (testResponse.status === 200) {
      console.log('✅ API key appears to be valid');
    } else if (testResponse.status === 401) {
      console.log('❌ API key is invalid or expired');
    } else if (testResponse.status === 429) {
      console.log('⚠️ Rate limit exceeded');
    } else {
      console.log('❓ Unexpected status code');
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Network issue - check internet connection');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Request timed out');
    } else if (error.response) {
      console.log('📊 Error Response Status:', error.response.status);
      console.log('📋 Error Response Data:', error.response.data);
    }
  }
}

// Also test with alternative parameters
async function testAlternativeParams() {
  console.log('');
  console.log('🧪 Testing Alternative Parameters');
  console.log('=================================');

  const api_key = '6882894b855f5678d36484c8';

  // Test different parameter combinations
  const testCases = [
    {
      name: 'Test 1: Standard profile',
      params: {
        api_key: api_key,
        type: 'profile',
        url: 'https://www.linkedin.com/in/musayevcreate',
      }
    },
    {
      name: 'Test 2: Profile with linkId',
      params: {
        api_key: api_key,
        type: 'profile',
        linkId: 'musayevcreate',
      }
    },
    {
      name: 'Test 3: Check account info',
      url: 'https://api.scrapingdog.com/account',
      params: {
        api_key: api_key
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n${testCase.name}:`);

      const url = testCase.url || 'https://api.scrapingdog.com/linkedin';
      const response = await axios.get(url, {
        params: testCase.params,
        timeout: 15000,
        validateStatus: false
      });

      console.log(`Status: ${response.status}`);
      const contentType = response.headers['content-type'];

      if (contentType && contentType.includes('application/json')) {
        console.log('✅ JSON response received');
        if (response.data && Object.keys(response.data).length < 10) {
          console.log('Data:', JSON.stringify(response.data, null, 2));
        } else {
          console.log('Data keys:', Object.keys(response.data || {}));
        }
      } else {
        console.log('❌ Non-JSON response');
        console.log('First 200 chars:', response.data.toString().substring(0, 200));
      }

    } catch (error) {
      console.log(`❌ ${testCase.name} failed:`, error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  await debugScrapingDogAPI();
  await testAlternativeParams();
  console.log('\n🏁 Debug completed');
}

runAllTests().catch(console.error);
