const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test user credentials (you may need to create a test user first)
const testUser = {
  email: 'test@example.com',
  password: 'testpass123'
};

async function testTemplatesAPI() {
  try {
    console.log('🔍 Testing Templates API...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User',
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.error?.includes('already')) {
        console.log('ℹ️  User already exists, continuing...');
      } else {
        console.error('❌ Registration failed:', error.response?.data);
        throw error;
      }
    }

    // Step 2: Login to get access token
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    const { accessToken } = loginResponse.data;
    console.log('✅ Login successful, got access token');

    // Step 3: Test templates API
    console.log('\n3. Testing templates API...');
    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ Templates API successful');
    console.log('📋 Templates found:', templatesResponse.data.length);
    
    // Display template details
    templatesResponse.data.forEach((template, index) => {
      console.log(`\n   Template ${index + 1}:`);
      console.log(`   - ID: ${template.id}`);
      console.log(`   - Name: ${template.name}`);
      console.log(`   - Tier: ${template.tier}`);
      console.log(`   - Preview URL: ${template.previewUrl}`);
      console.log(`   - Has Access: ${template.hasAccess}`);
    });

    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testTemplatesAPI();
