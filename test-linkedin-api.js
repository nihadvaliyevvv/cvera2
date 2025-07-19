const axios = require('axios');

async function testLinkedInImport() {
  try {
    console.log('🚀 LinkedIn import test başlayır...');
    console.log('🔑 API Key: 736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d');
    console.log('🌐 Host: fresh-linkedin-profile-data.p.rapidapi.com');
    
    const response = await axios.post('http://localhost:3000/api/import/linkedin', {
      url: 'https://www.linkedin.com/in/johnsmith'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error status:', error.response?.status);
    console.log('📄 Error data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Error message:', error.message);
    
    // Additional error details
    if (error.response?.data?.error) {
      console.log('💡 API Error:', error.response.data.error);
    }
  }
}

console.log('⏳ 3 saniyə gözləyir server başlasın...');
setTimeout(testLinkedInImport, 3000);
