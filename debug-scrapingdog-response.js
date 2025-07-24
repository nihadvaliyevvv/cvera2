const axios = require('axios');

async function testScrapingDogAPI() {
  try {
    console.log('🔍 Testing ScrapingDog API response structure...');
    
    const response = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: '6882894b855f5678d36484c8',
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false',
      }
    });
    
    console.log('📋 All available keys in ScrapingDog response:');
    Object.keys(response.data).forEach(key => {
      const value = response.data[key];
      const type = typeof value;
      const isArray = Array.isArray(value);
      const length = isArray ? value.length : (type === 'string' ? value.length : 'N/A');
      console.log(`- ${key}: ${type} ${isArray ? '(array)' : ''} - Length: ${length}`);
    });
    
    // Check specific fields we're looking for
    console.log('\n💪 Skills data:');
    console.log('skills:', response.data.skills);
    if (response.data.skills && typeof response.data.skills === 'object') {
      console.log('skills keys:', Object.keys(response.data.skills));
    }
    
    console.log('\n🌍 Languages data:');
    console.log('languages:', response.data.languages);
    
    console.log('\n🚀 Projects data:');
    console.log('projects:', response.data.projects);
    
    console.log('\n🤝 Volunteer experience data:');
    console.log('volunteer_experience:', response.data.volunteer_experience);
    console.log('volunteerExperience:', response.data.volunteerExperience);
    console.log('volunteer:', response.data.volunteer);
    console.log('volunteering:', response.data.volunteering);
    
    // Check certifications too
    console.log('\n🏆 Certifications data:');
    console.log('certifications:', response.data.certifications);
    console.log('certificates:', response.data.certificates);
    console.log('licenses_and_certifications:', response.data.licenses_and_certifications);
    
    console.log('\n📄 Sample of full response:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 2000) + '...');
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testScrapingDogAPI();
