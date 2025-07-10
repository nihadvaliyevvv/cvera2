const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testProfessionalTemplate() {
  try {
    console.log('🎨 Testing Professional Resume Template...\n');

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    const { accessToken } = loginResponse.data;

    // Get templates
    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('📋 Available templates:');
    templatesResponse.data.forEach(template => {
      console.log(`   - ${template.name} (${template.tier}) - Access: ${template.hasAccess}`);
    });
    
    // Find Professional Resume template
    const professionalTemplate = templatesResponse.data.find(t => t.name.includes('Professional Resume'));
    
    if (!professionalTemplate) {
      console.log('❌ Professional Resume template not found!');
      return;
    }
    
    console.log('\n✅ Professional Resume template found:');
    console.log(`   - ID: ${professionalTemplate.id}`);
    console.log(`   - Name: ${professionalTemplate.name}`);
    console.log(`   - Tier: ${professionalTemplate.tier}`);
    console.log(`   - Has Access: ${professionalTemplate.hasAccess}`);
    
    // Test creating a CV with this template
    const testCVData = {
      title: 'Professional Resume Test',
      cv_data: {
        templateId: professionalTemplate.id,
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          location: 'New York, NY',
          website: 'https://johndoe.com',
          summary: 'Experienced software developer with 5+ years of experience in full-stack development.'
        },
        experience: [
          {
            id: '1',
            company: 'Tech Corp',
            position: 'Senior Software Engineer',
            startDate: '2020-01',
            endDate: '2024-01',
            current: false,
            description: 'Led development of web applications using React and Node.js',
            location: 'San Francisco, CA'
          }
        ],
        education: [
          {
            id: '1',
            institution: 'Stanford University',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2016-09',
            endDate: '2020-05',
            current: false
          }
        ],
        skills: [
          { id: '1', name: 'JavaScript', level: 'Expert' },
          { id: '2', name: 'React', level: 'Advanced' },
          { id: '3', name: 'Node.js', level: 'Advanced' }
        ],
        languages: [
          { id: '1', name: 'English', level: 'Native' },
          { id: '2', name: 'Spanish', level: 'Professional' }
        ],
        projects: [],
        certifications: []
      }
    };

    const createCVResponse = await axios.post(`${BASE_URL}/api/cvs`, testCVData, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    console.log('\n✅ Test CV created successfully with Professional Resume template!');
    console.log(`   - CV ID: ${createCVResponse.data.id}`);
    console.log(`   - Template ID: ${createCVResponse.data.templateId}`);
    
    console.log('\n🎉 Professional Resume template is working correctly!');
    console.log('   - Template loaded properly');
    console.log('   - CV can be created with this template');
    console.log('   - Sidebar layout should be applied in preview');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProfessionalTemplate();
