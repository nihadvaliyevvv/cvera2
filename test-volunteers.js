const axios = require('axios');

// Test LinkedIn volunteers import
async function testVolunteers() {
  try {
    const testUrl = 'https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile';
    const sampleProfile = 'https://www.linkedin.com/in/johnreed2/'; // Different profile
    const apiKey = '736369eb1bmshb216361e2e5b584p1b850ejsn9e0e4a8c5b2d'; // Third API key
    
    console.log('Testing LinkedIn volunteers import...');
    
    const response = await axios.get(testUrl, {
      params: {
        linkedin_url: sampleProfile,
        include_volunteers: 'true',
        include_volunteer_experience: 'true',
        include_volunteering: 'true',
        include_volunteer_work: 'true'
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data structure:', Object.keys(response.data));
    
    // Check for volunteer data
    const data = response.data;
    
    console.log('\n=== Volunteer Data Analysis ===');
    console.log('volunteer field:', data.volunteer ? 'exists' : 'missing');
    console.log('volunteers field:', data.volunteers ? 'exists' : 'missing');
    console.log('volunteer_experience field:', data.volunteer_experience ? 'exists' : 'missing');
    console.log('volunteering field:', data.volunteering ? 'exists' : 'missing');
    console.log('volunteer_work field:', data.volunteer_work ? 'exists' : 'missing');
    
    if (data.volunteer) {
      console.log('volunteer data:', JSON.stringify(data.volunteer, null, 2));
    }
    
    if (data.volunteers) {
      console.log('volunteers data:', JSON.stringify(data.volunteers, null, 2));
    }
    
    if (data.volunteer_experience) {
      console.log('volunteer_experience data:', JSON.stringify(data.volunteer_experience, null, 2));
    }
    
    if (data.volunteering) {
      console.log('volunteering data:', JSON.stringify(data.volunteering, null, 2));
    }
    
    if (data.volunteer_work) {
      console.log('volunteer_work data:', JSON.stringify(data.volunteer_work, null, 2));
    }
    
    // Test extraction function
    const extractVolunteer = (data) => {
      const volunteers = [];
      
      if (data.volunteer && Array.isArray(data.volunteer)) {
        volunteers.push(...data.volunteer);
      }
      
      if (data.volunteers && Array.isArray(data.volunteers)) {
        volunteers.push(...data.volunteers);
      }
      
      if (data.volunteer_experience && Array.isArray(data.volunteer_experience)) {
        volunteers.push(...data.volunteer_experience);
      }
      
      if (data.volunteering && Array.isArray(data.volunteering)) {
        volunteers.push(...data.volunteering);
      }
      
      if (data.volunteer_work && Array.isArray(data.volunteer_work)) {
        volunteers.push(...data.volunteer_work);
      }
      
      console.log('Total volunteer entries found:', volunteers.length);
      
      return volunteers.map((vol) => ({
        organization: vol.organization || vol.company || vol.org || "",
        role: vol.role || vol.title || vol.position || "",
        description: vol.description || "",
        start_date: vol.start_date || vol.startDate || "",
        end_date: vol.end_date || vol.endDate || "",
        cause: vol.cause || vol.category || ""
      }));
    };
    
    const extractedVolunteers = extractVolunteer(data);
    console.log('\n=== Extracted Volunteers ===');
    console.log(JSON.stringify(extractedVolunteers, null, 2));
    
  } catch (error) {
    console.error('Error testing volunteers:', error.response?.data || error.message);
  }
}

// Load environment variables
require('dotenv').config();

testVolunteers();
