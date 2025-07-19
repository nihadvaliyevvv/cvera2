const https = require('https');
const querystring = require('querystring');

function testLinkedInAPI() {
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
        console.log('✅ API Response Status:', res.statusCode);
        console.log('📊 Response Data Keys:', Object.keys(response));
        
        const profileData = response.data || response;
        console.log('📊 Profile Data Keys:', Object.keys(profileData));
        
        console.log('\n🔍 Skills Data:');
        console.log('Type:', typeof profileData.skills);
        console.log('Is Array:', Array.isArray(profileData.skills));
        console.log('Content:', profileData.skills);
        
        console.log('\n🔍 Certifications Data:');
        console.log('Type:', typeof profileData.certifications);
        console.log('Is Array:', Array.isArray(profileData.certifications));
        console.log('Content:', profileData.certifications);
        
        console.log('\n🔍 Honors and Awards Data:');
        console.log('Type:', typeof profileData.honors_and_awards);
        console.log('Is Array:', Array.isArray(profileData.honors_and_awards));
        console.log('Content:', profileData.honors_and_awards);
        
        console.log('\n🔍 Languages Data:');
        console.log('Type:', typeof profileData.languages);
        console.log('Is Array:', Array.isArray(profileData.languages));
        console.log('Content:', profileData.languages);
        
        console.log('\n🔍 Volunteers Data:');
        console.log('Type:', typeof profileData.volunteers);
        console.log('Is Array:', Array.isArray(profileData.volunteers));
        console.log('Content:', profileData.volunteers);
        
      } catch (error) {
        console.error('❌ JSON Parse Error:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.end();
}

testLinkedInAPI();
