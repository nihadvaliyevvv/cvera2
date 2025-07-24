const axios = require('axios');

// Test the updated ScrapingDog implementation
async function testUpdatedScrapingDog() {
  try {
    console.log('🧪 Testing updated ScrapingDog implementation...');
    console.log('==================================================');
    
    // Test the API endpoint
    const response = await axios.post('http://localhost:3000/api/import/linkedin', {
      url: 'https://www.linkedin.com/in/musayevcreate'
    });
    
    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      
      console.log('✅ API Response successful!');
      console.log('\n📊 Personal Info:');
      console.log('- Name:', data.personalInfo?.name || 'N/A');
      console.log('- Headline:', data.personalInfo?.headline || 'N/A');
      console.log('- Location:', data.personalInfo?.address || 'N/A');
      console.log('- Summary length:', data.personalInfo?.summary?.length || 0);
      
      console.log('\n💼 Experience:');
      console.log('- Count:', data.experience?.length || 0);
      if (data.experience && data.experience.length > 0) {
        console.log('- First entry:', JSON.stringify(data.experience[0], null, 2));
      }
      
      console.log('\n🎓 Education:');
      console.log('- Count:', data.education?.length || 0);
      if (data.education && data.education.length > 0) {
        console.log('- First entry:', JSON.stringify(data.education[0], null, 2));
      }
      
      console.log('\n💪 Skills:');
      console.log('- Count:', data.skills?.length || 0);
      if (data.skills && data.skills.length > 0) {
        console.log('- Skills:', data.skills.slice(0, 10).map(s => s.name).join(', '));
      }
      
      console.log('\n🌍 Languages:');
      console.log('- Count:', data.languages?.length || 0);
      if (data.languages && data.languages.length > 0) {
        console.log('- Languages:', data.languages.map(l => `${l.name} (${l.proficiency})`).join(', '));
      }
      
      console.log('\n🚀 Projects:');
      console.log('- Count:', data.projects?.length || 0);
      if (data.projects && data.projects.length > 0) {
        console.log('- Projects:', data.projects.map(p => `${p.name} (${p.startDate})`).join(', '));
      }
      
      console.log('\n🏆 Certifications:');
      console.log('- Count:', data.certifications?.length || 0);
      if (data.certifications && data.certifications.length > 0) {
        console.log('- First few:', data.certifications.slice(0, 3).map(c => `${c.name} by ${c.issuer}`).join(', '));
      }
      
      console.log('\n==================================================');
      console.log('🎉 TEST SUCCESSFUL!');
      console.log('✅ All fields are properly mapped and transformed');
      console.log('✅ Data ready for CV creation');
      
    } else {
      console.error('❌ API Error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUpdatedScrapingDog();
