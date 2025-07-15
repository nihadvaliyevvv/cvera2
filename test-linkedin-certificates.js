const fetch = require('node-fetch');
const fs = require('fs');

// Test LinkedIn import directly
async function testLinkedInImport() {
  const testUrl = 'https://www.linkedin.com/in/muradmusayev';
  
  try {
    console.log('Testing LinkedIn import for certificates...');
    
    // Simulate the API call
    const response = await fetch('http://localhost:3001/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-test-token'
      },
      body: JSON.stringify({
        url: testUrl
      })
    });
    
    const result = await response.json();
    
    console.log('LinkedIn API Response Status:', response.status);
    
    if (response.ok) {
      console.log('Success! Certificate data found:', result.certifications);
    } else {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test the direct LinkedIn import
testLinkedInImport();
