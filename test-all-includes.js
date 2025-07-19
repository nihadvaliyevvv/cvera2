// Test all LinkedIn API include parameters
const https = require('https');
const querystring = require('querystring');

function testAllParameters() {
  const params = querystring.stringify({
    linkedin_url: 'https://www.linkedin.com/in/reidhoffman/',
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

  console.log('🔧 Testing with parameters:', {
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
        
        console.log('\n🎯 AVAILABILITY CHECK:');
        console.log('✅ Skills:', profileData.skills ? 'AVAILABLE' : 'EMPTY/NULL', typeof profileData.skills);
        console.log('✅ Certifications:', profileData.certifications ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.certifications) ? profileData.certifications.length : 'N/A');
        console.log('✅ Honors & Awards:', profileData.honors_and_awards ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.honors_and_awards) ? profileData.honors_and_awards.length : 'N/A');
        console.log('✅ Projects:', profileData.projects ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.projects) ? profileData.projects.length : 'N/A');
        console.log('✅ Volunteers:', profileData.volunteers ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.volunteers) ? profileData.volunteers.length : 'N/A');
        console.log('✅ Publications:', profileData.publications ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.publications) ? profileData.publications.length : 'N/A');
        console.log('✅ Languages:', profileData.languages ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.languages) ? profileData.languages.length : 'N/A');
        console.log('✅ Courses:', profileData.courses ? 'AVAILABLE' : 'EMPTY/NULL', Array.isArray(profileData.courses) ? profileData.courses.length : 'N/A');
        
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

testAllParameters();
