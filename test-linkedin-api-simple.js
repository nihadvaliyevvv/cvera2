// Test LinkedIn Import API
const testLinkedInImport = async () => {
  console.log('🧪 Testing LinkedIn Import API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock token
      },
      body: JSON.stringify({ 
        url: 'https://www.linkedin.com/in/johndoe' 
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ LinkedIn Import TEST PASSED');
      console.log('✅ Data received:', Object.keys(data.data));
    } else {
      console.log('❌ LinkedIn Import TEST FAILED');
      console.log('❌ Error:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
};

testLinkedInImport();
