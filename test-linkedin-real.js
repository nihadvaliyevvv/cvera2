// Test real LinkedIn API structure  
const axios = require('axios');

async function testRealLinkedInAPI() {
  const testUrl = 'https://www.linkedin.com/in/williamhgates';
  const apiKey = process.env.RAPIDAPI_KEY_1 || 'your-key-here';
  
  if (!apiKey || apiKey === 'your-key-here') {
    console.log('❌ RapidAPI key not found. Using mock data structure test.');
    return;
  }
  
  try {
    console.log('Testing real LinkedIn API response structure...');
    
    const response = await axios.get(
      `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile`,
      {
        params: { linkedin_url: testUrl },
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
        }
      }
    );
    
    const data = response.data.data;
    
    console.log('\n=== Real LinkedIn API Response Structure ===');
    console.log('Has languages:', !!data.languages);
    console.log('Languages count:', (data.languages || []).length);
    console.log('Languages sample:', data.languages ? data.languages.slice(0, 2) : 'None');
    
    console.log('\nHas certifications:', !!data.certifications);
    console.log('Certifications count:', (data.certifications || []).length);
    console.log('Certifications sample:', data.certifications ? data.certifications.slice(0, 2) : 'None');
    
    console.log('\nHas projects:', !!data.projects);
    console.log('Projects count:', (data.projects || []).length);
    console.log('Projects sample:', data.projects ? data.projects.slice(0, 2) : 'None');
    
    console.log('\nHas volunteer:', !!data.volunteer);
    console.log('Volunteer count:', (data.volunteer || []).length);
    console.log('Volunteer sample:', data.volunteer ? data.volunteer.slice(0, 2) : 'None');
    
    console.log('\n=== Response Keys ===');
    console.log('Available keys:', Object.keys(data));
    
  } catch (error) {
    console.error('❌ LinkedIn API test failed:', error.message);
    console.log('This is expected if API key is not configured or rate limited.');
  }
}

// Test with mock data to verify structure
console.log('=== Testing with mock data structure ===');
const mockData = {
  languages: [],
  certifications: [],
  projects: [],
  volunteer: []
};

console.log('Mock languages:', mockData.languages);
console.log('Mock certifications:', mockData.certifications);
console.log('Mock projects:', mockData.projects);
console.log('Mock volunteer:', mockData.volunteer);

// Test empty arrays properly map
const extractCertifications = (data) => {
  return (data.certifications || []).map((cert) => ({
    name: cert.name || cert.title || "",
    issuer: cert.authority || cert.issuer || cert.organization || "",
    date: cert.date || `${cert.start_date || ""} - ${cert.end_date || ""}`,
    url: cert.url || "",
    license_number: cert.license_number || cert.credential_id || "",
  }));
};

const extractProjects = (data) => {
  return (data.projects || []).map((project) => ({
    name: project.name || project.title || "",
    description: project.description || "",
    url: project.url || "",
    date: project.date || `${project.start_date || ""} - ${project.end_date || ""}`,
  }));
};

const extractVolunteer = (data) => {
  return (data.volunteer || data.volunteer_experience || []).map((vol) => ({
    organization: vol.organization || vol.company || "",
    role: vol.role || vol.title || vol.position || "",
    description: vol.description || "",
    start_date: vol.start_date || "",
    end_date: vol.end_date || "",
    cause: vol.cause || "",
  }));
};

console.log('\n=== Testing empty arrays ===');
console.log('Empty certifications:', extractCertifications(mockData));
console.log('Empty projects:', extractProjects(mockData));
console.log('Empty volunteer:', extractVolunteer(mockData));

// Test LinkedIn API if key is available
testRealLinkedInAPI();
