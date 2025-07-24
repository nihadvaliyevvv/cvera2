// Test the working API key through our own import endpoint
const fetch = require('node-fetch');

async function testWorkingApiKey() {
  try {
    console.log('🧪 İşləyən API key-i test edirik...');

    // First, let's add the working API key manually via our own API
    console.log('📝 Yeni API key əlavə edilir...');
    
    const addKeyResponse = await fetch('http://localhost:3000/api/admin/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add admin auth if needed
      },
      body: JSON.stringify({
        name: 'Working Fresh LinkedIn API',
        key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
        service: 'linkedin',
        host: 'fresh-linkedin-profile-data.p.rapidapi.com',
        priority: 1,
        dailyLimit: 1000
      })
    });

    if (addKeyResponse.ok) {
      const result = await addKeyResponse.json();
      console.log('✅ API key əlavə edildi:', result);
    } else {
      console.log('❌ API key əlavə etmə xətası:', await addKeyResponse.text());
    }

    // Now test LinkedIn import
    console.log('\n🔍 LinkedIn import test edilir...');
    
    const importResponse = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTE3NTMzNTYxMjIyOTgiLCJpYXQiOjE3Mzc3NjU3MjIsImV4cCI6MTczNzg1MjEyMn0.FjEA3H-_6v3KGfLUcFgJUfEr5hK3kKxR7yKdMQZoNMY' // Mock token for testing
      },
      body: JSON.stringify({
        linkedinUrl: 'https://linkedin.com/in/detail-test'
      })
    });

    console.log(`📡 Import Response Status: ${importResponse.status}`);
    const importResult = await importResponse.text();
    console.log(`📄 Import Response:`, importResult.substring(0, 1000));

  } catch (error) {
    console.error('💥 Test xətası:', error);
  }
}

testWorkingApiKey();
