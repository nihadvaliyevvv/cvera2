// Test script to debug export functionality
const axios = require('axios');

async function testExport() {
  try {
    // First, let's test the health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/api/health');
    console.log('Health check:', healthResponse.data);
    
    // Test the download endpoint directly (this will fail but we can see the error)
    console.log('\nTesting download endpoint...');
    const downloadResponse = await axios.post('http://localhost:3000/api/cvs/test-id/download', {
      format: 'pdf'
    }, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    }).catch(err => {
      console.log('Expected error (no auth):', err.response?.data || err.message);
      return err.response;
    });
    
    console.log('Download response status:', downloadResponse?.status);
    console.log('Download response data:', downloadResponse?.data);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testExport();
