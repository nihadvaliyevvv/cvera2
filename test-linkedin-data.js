const axios = require('axios');

async function testLinkedInData() {
  try {
    console.log('🚀 LinkedIn API test - hansı datalar gəlir...');
    
    const response = await axios.post('http://localhost:3000/api/import/linkedin', {
      url: 'https://www.linkedin.com/in/williamhgates'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    
    if (response.data.success) {
      console.log('✅ API SUCCESS');
      console.log('📊 Gələn data structure:');
      console.log(JSON.stringify(response.data.data, null, 2));
      
      // Analyze what sections we get
      const data = response.data.data;
      console.log('\n🔍 SECTION ANALYSİS:');
      console.log('👤 Personal Info:', data.personalInfo ? '✅' : '❌');
      console.log('💼 Experience:', data.experience?.length || 0, 'entries');
      console.log('🎓 Education:', data.education?.length || 0, 'entries');
      console.log('🛠️ Skills:', data.skills?.length || 0, 'entries');
      console.log('🌍 Languages:', data.languages?.length || 0, 'entries');
      console.log('🚀 Projects:', data.projects?.length || 0, 'entries');
      console.log('🏆 Certifications:', data.certifications?.length || 0, 'entries');
      console.log('❤️ Volunteer:', data.volunteerExperience?.length || 0, 'entries');
      
    } else {
      console.log('❌ API ERROR:', response.data.error);
    }
    
  } catch (error) {
    console.log('❌ REQUEST ERROR:', error.message);
  }
}

testLinkedInData();
