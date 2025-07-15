const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCVFunctionality() {
  try {
    console.log('🧪 CV Functionality Test');
    console.log('========================');
    
    // Test 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    if (!loginResponse.data.accessToken) {
      console.log('❌ Login failed - no access token');
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.accessToken;
    
    // Test 2: Get CVs
    console.log('\n2. Testing CV list...');
    const cvsResponse = await axios.get(`${BASE_URL}/api/cvs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ CV list retrieved: ${cvsResponse.data.length} CVs found`);
    if (cvsResponse.data.length > 0) {
      console.log('   Sample CV:', cvsResponse.data[0]);
    }
    
    // Test 3: Get templates
    console.log('\n3. Testing templates...');
    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Templates retrieved: ${templatesResponse.data.length} templates found`);
    if (templatesResponse.data.length > 0) {
      console.log('   Sample template:', templatesResponse.data[0]);
    }
    
    // Test 4: Create CV
    console.log('\n4. Testing CV creation...');
    const cvData = {
      title: 'Test CV - ' + new Date().toISOString(),
      cv_data: {
        templateId: 'template-1',
        personalInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+994 50 123 4567',
          location: 'Bakı, Azərbaycan'
        },
        experience: [{
          id: '1',
          company: 'Test Company',
          position: 'Developer',
          startDate: '2020-01',
          endDate: '2024-01',
          description: 'Test description'
        }]
      }
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/cvs`, cvData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ CV created successfully: ${createResponse.data.id}`);
    
    // Test 5: Get CVs again to verify
    console.log('\n5. Verifying CV creation...');
    const updatedCvsResponse = await axios.get(`${BASE_URL}/api/cvs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Updated CV count: ${updatedCvsResponse.data.length} CVs found`);
    
    console.log('\n🎉 All tests passed! CV functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testCVFunctionality();
