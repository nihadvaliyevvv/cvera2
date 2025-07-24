const axios = require('axios');

async function analyzeScrapingDogResponse() {
  try {
    console.log('🔍 Analyzing ScrapingDog API response structure...');
    
    const response = await axios.get('https://api.scrapingdog.com/linkedin', {
      params: {
        api_key: '6882894b855f5678d36484c8',
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false',
      }
    });
    
    // The response is an array, get the first object
    const profileData = response.data[0];
    
    console.log('📋 Keys in the profile object:');
    Object.keys(profileData).forEach(key => {
      const value = profileData[key];
      const type = typeof value;
      const isArray = Array.isArray(value);
      const length = isArray ? value.length : (type === 'string' && value ? value.length : 'N/A');
      console.log(`- ${key}: ${type} ${isArray ? '(array)' : ''} - Length: ${length}`);
    });
    
    // Look for skills-related fields
    console.log('\n🔍 Looking for skills-related fields:');
    Object.keys(profileData).forEach(key => {
      if (key.toLowerCase().includes('skill')) {
        console.log(`Found skills field: ${key} =`, profileData[key]);
      }
    });
    
    // Look for language-related fields
    console.log('\n🔍 Looking for language-related fields:');
    Object.keys(profileData).forEach(key => {
      if (key.toLowerCase().includes('lang')) {
        console.log(`Found language field: ${key} =`, profileData[key]);
      }
    });
    
    // Look for project-related fields
    console.log('\n🔍 Looking for project-related fields:');
    Object.keys(profileData).forEach(key => {
      if (key.toLowerCase().includes('project')) {
        console.log(`Found project field: ${key} =`, profileData[key]);
      }
    });
    
    // Look for volunteer-related fields
    console.log('\n🔍 Looking for volunteer-related fields:');
    Object.keys(profileData).forEach(key => {
      if (key.toLowerCase().includes('volunt')) {
        console.log(`Found volunteer field: ${key} =`, profileData[key]);
      }
    });
    
    // Look for certification-related fields
    console.log('\n🔍 Looking for certification-related fields:');
    Object.keys(profileData).forEach(key => {
      if (key.toLowerCase().includes('cert') || key.toLowerCase().includes('license')) {
        console.log(`Found certification field: ${key} =`, profileData[key]);
      }
    });
    
    // Experience array analysis
    console.log('\n📊 Experience array analysis:');
    if (profileData.experience && Array.isArray(profileData.experience)) {
      console.log(`Found ${profileData.experience.length} experience entries`);
      if (profileData.experience.length > 0) {
        console.log('Keys in first experience entry:', Object.keys(profileData.experience[0]));
      }
    }
    
    // Education array analysis
    console.log('\n🎓 Education array analysis:');
    if (profileData.education && Array.isArray(profileData.education)) {
      console.log(`Found ${profileData.education.length} education entries`);
      if (profileData.education.length > 0) {
        console.log('Keys in first education entry:', Object.keys(profileData.education[0]));
      }
    }
    
    console.log('\n📄 Full profile data sample:');
    console.log(JSON.stringify(profileData, null, 2));
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

analyzeScrapingDogResponse();
