const axios = require('axios');

async function testLinkedInImport() {
  try {
    console.log('🚀 LinkedIn import test...');
    
    const response = await axios.post('http://localhost:3000/api/import/linkedin', {
      url: 'https://www.linkedin.com/in/johnsmith'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error status:', error.response?.status);
    console.log('📄 Error data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Error message:', error.message);
  }
}

testLinkedInImport();
