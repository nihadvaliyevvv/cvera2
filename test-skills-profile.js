// Test specific profile with skills and certifications
const https = require('https');
const querystring = require('querystring');

function testSkillsProfile() {
  // Test Jeff Weiner profile (LinkedIn CEO) - likely to have skills and certs
  const params = querystring.stringify({
    linkedin_url: 'https://www.linkedin.com/in/jeffweiner08/',
    include_skills: 'true',
    include_certifications: 'true',
    include_honors: 'true',
    include_projects: 'true',
    include_volunteers: 'true',
    include_publications: 'true',
    include_patents: 'true',
    include_courses: 'true',
    include_organizations: 'true',
    include_profile_status: 'true',
    include_company_public_url: 'true'
  });

  const options = {
    hostname: 'fresh-linkedin-profile-data.p.rapidapi.com',
    path: `/get-profile-public-data?${params}`,
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
      'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const profileData = response.data || response;
        
        console.log('🔍 Testing Satya Nadella profile:');
        console.log('✅ Skills:', profileData.skills || 'EMPTY');
        console.log('✅ Skills type:', typeof profileData.skills);
        console.log('✅ Skills length/content:', profileData.skills ? profileData.skills.length : 'N/A');
        
        if (profileData.skills && typeof profileData.skills === 'string') {
          const skillsArray = profileData.skills.split('|');
          console.log('✅ Parsed skills (first 5):', skillsArray.slice(0, 5));
          console.log('✅ Total skills count:', skillsArray.length);
        }
        
        console.log('\n✅ Certifications:', profileData.certifications);
        console.log('✅ Certifications count:', Array.isArray(profileData.certifications) ? profileData.certifications.length : 'N/A');
        
        console.log('\n✅ Honors & Awards:', profileData.honors_and_awards ? profileData.honors_and_awards.length : 'EMPTY');
        console.log('✅ Volunteers:', profileData.volunteers ? profileData.volunteers.length : 'EMPTY');
        
      } catch (error) {
        console.error('❌ JSON Parse Error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.end();
}

testSkillsProfile();
