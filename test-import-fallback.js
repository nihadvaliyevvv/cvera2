async function testImportWithFallback() {
  console.log('🧪 Testing LinkedIn Import with Fallback System\n');

  const testUrls = [
    'https://linkedin.com/in/williamhgates',
    'https://linkedin.com/in/test-user',
    'https://linkedin.com/in/musayev-ali'
  ];

  for (const testUrl of testUrls) {
    console.log(`🔗 Testing URL: ${testUrl}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/import/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: testUrl
        })
      });

      console.log(`📡 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS - Name: ${data.personalInfo?.name}`);
        console.log(`📝 Summary: ${data.personalInfo?.summary}`);
        console.log(`🏷️ Languages: ${data.languages?.map(l => l.name).join(', ')}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ERROR: ${errorText}`);
      }
    } catch (error) {
      console.log(`💥 Request failed: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
}

// Wait for server to start
setTimeout(testImportWithFallback, 3000);
