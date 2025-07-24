// Simple test to call our LinkedIn import API directly
import fetch from 'node-fetch';

async function testLinkedInImport() {
  try {
    console.log('🧪 Testing LinkedIn import directly...');

    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        linkedinUrl: 'https://linkedin.com/in/detail-test'
      })
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`📄 Response Body:`, responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Parsed Response:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log('❌ Could not parse JSON response');
      }
    }

  } catch (error) {
    console.error('💥 Test Error:', error);
  }
}

testLinkedInImport();
