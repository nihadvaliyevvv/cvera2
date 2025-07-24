const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRapidApiEndpoints() {
  console.log('🔍 RapidAPI LinkedIn Endpoint Test\n');

  try {
    // Get first API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        active: true,
        service: 'linkedin'
      }
    });

    if (!apiKey) {
      console.log('❌ API key tapılmadı');
      return;
    }

    console.log(`🔑 Test edilən API key: ${apiKey.name}`);
    console.log(`🌐 Host: ${apiKey.host || 'DEFAULT'}`);

    const testHost = apiKey.host || 'fresh-linkedin-profile-data.p.rapidapi.com';
    const testUrl = 'https://linkedin.com/in/williamhgates';

    // Test different endpoints
    const endpoints = [
      { path: '/get-profile', method: 'POST' },
      { path: '/profile', method: 'POST' },
      { path: '/', method: 'POST' },
      { path: '/linkedin-profile', method: 'POST' },
      { path: '/scrape', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testing ${endpoint.method} https://${testHost}${endpoint.path}`);
      
      try {
        const response = await fetch(`https://${testHost}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'X-RapidAPI-Key': apiKey.key,
            'X-RapidAPI-Host': testHost,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            linkedin_url: testUrl,
            url: testUrl,
            profile_url: testUrl
          })
        });

        console.log(`📡 Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`📄 Response length: ${responseText.length} chars`);
        
        if (responseText.length > 0 && responseText.length < 500) {
          console.log(`📝 Response: ${responseText}`);
        } else if (responseText.length > 500) {
          console.log(`📝 Response (first 200 chars): ${responseText.substring(0, 200)}...`);
        }

        // If successful, try to parse JSON
        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log('✅ JSON parse successful!');
            if (data.data || data.profile || data.name) {
              console.log('🎉 Profile data detected!');
              break; // Found working endpoint
            }
          } catch (e) {
            console.log('❌ Response is not JSON');
          }
        }
      } catch (error) {
        console.log(`💥 Request failed: ${error.message}`);
      }
    }

    // Test if it's a GET endpoint instead
    console.log(`\n🧪 Testing GET request`);
    try {
      const getResponse = await fetch(`https://${testHost}/?url=${encodeURIComponent(testUrl)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey.key,
          'X-RapidAPI-Host': testHost
        }
      });

      console.log(`📡 GET Status: ${getResponse.status}`);
      const getResponseText = await getResponse.text();
      console.log(`📄 GET Response length: ${getResponseText.length} chars`);
      
      if (getResponseText.length > 0 && getResponseText.length < 500) {
        console.log(`📝 GET Response: ${getResponseText}`);
      }
    } catch (error) {
      console.log(`💥 GET Request failed: ${error.message}`);
    }

  } catch (error) {
    console.error('💥 Test xətası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRapidApiEndpoints();
