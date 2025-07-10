// Simple test to verify templates API integration
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPIIntegration() {
  try {
    console.log('🔍 Testing API Integration...\n');

    // Test 1: Check if server is running
    console.log('1. Checking server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running and healthy');

    // Test 2: Test templates API without auth (should fail)
    console.log('\n2. Testing templates API without authentication...');
    try {
      await axios.get(`${BASE_URL}/api/templates`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthorized request');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Test with valid auth
    console.log('\n3. Testing with authentication...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    const { accessToken } = loginResponse.data;

    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    console.log('✅ Templates API working correctly');
    console.log(`📊 Found ${templatesResponse.data.length} templates`);
    
    // Count templates by tier
    const tierCounts = templatesResponse.data.reduce((acc, template) => {
      acc[template.tier] = (acc[template.tier] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Template distribution:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   - ${tier}: ${count} templates`);
    });

    // Count accessible templates
    const accessibleCount = templatesResponse.data.filter(t => t.hasAccess).length;
    console.log(`🔓 Accessible templates: ${accessibleCount}/${templatesResponse.data.length}`);

    console.log('\n🎉 All integration tests passed!');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPIIntegration();
