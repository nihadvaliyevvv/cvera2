// Test LinkedIn import with real server
const axios = require('axios');

async function testLinkedInImport() {
  try {
    console.log('Testing LinkedIn import with server...');
    
    // Test LinkedIn import API directly
    const response = await axios.post('http://localhost:3000/api/import/linkedin', {
      url: 'https://www.linkedin.com/in/williamhgates'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if certificates, projects, volunteer are included
    const data = response.data;
    if (data.certifications) {
      console.log('✅ Certifications found:', data.certifications.length);
    } else {
      console.log('❌ No certifications found');
    }
    
    if (data.projects) {
      console.log('✅ Projects found:', data.projects.length);
    } else {
      console.log('❌ No projects found');
    }
    
    if (data.volunteer_experience) {
      console.log('✅ Volunteer experience found:', data.volunteer_experience.length);
    } else {
      console.log('❌ No volunteer experience found');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

testLinkedInImport();
