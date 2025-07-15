const axios = require('axios');

// Test LinkedIn honors & awards, certificates, and volunteer data extraction
async function testLinkedInExtractions() {
  try {
    // Mock LinkedIn API response with all sections
    const mockLinkedInResponse = {
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          authority: 'Amazon Web Services',
          issued: '2023-01-01',
          url: 'https://aws.amazon.com/certification/',
          license_number: 'AWS-123456'
        },
        {
          name: 'Google Cloud Professional',
          authority: 'Google',
          issue_date: '2023-06-01',
          credential_id: 'GCP-789012'
        }
      ],
      volunteer_experience: [
        {
          organization: 'Red Cross',
          role: 'Volunteer Coordinator',
          description: 'Coordinated disaster relief efforts',
          start_date: '2022-01-01',
          end_date: '2023-12-31',
          cause: 'Disaster Relief'
        },
        {
          organization: 'Local Food Bank',
          role: 'Food Distributor',
          description: 'Helped distribute food to families in need',
          start_date: '2021-06-01',
          cause: 'Hunger Relief'
        }
      ],
      honors_awards: [
        {
          title: 'Employee of the Year',
          issuer: 'ABC Corporation',
          date: '2023-12-01',
          description: 'Recognized for outstanding performance'
        },
        {
          title: 'Innovation Award',
          issuer: 'Tech Conference 2023',
          date: '2023-08-15',
          description: 'Award for innovative project'
        }
      ]
    };

    console.log('=== Testing Certifications Extraction ===');
    
    // Test certification extraction with improved date handling
    const extractCertifications = (data) => {
      console.log('Raw certifications data:', JSON.stringify(data.certifications || [], null, 2));
      
      return (data.certifications || []).map((cert) => ({
        name: cert.name || cert.title || '',
        issuer: cert.authority || cert.issuer || cert.organization || '',
        date: cert.issued || cert.date || cert.issue_date || `${cert.start_date || ''} - ${cert.end_date || ''}`,
        url: cert.url || '',
        license_number: cert.license_number || cert.credential_id || '',
      }));
    };

    const extractedCertifications = extractCertifications(mockLinkedInResponse);
    console.log('Extracted certificates:', JSON.stringify(extractedCertifications, null, 2));

    console.log('\n=== Testing Volunteer Experience Extraction ===');
    
    // Test volunteer extraction with date formatting
    const extractVolunteer = (data) => {
      console.log('Raw volunteer data:', JSON.stringify(data.volunteer_experience || [], null, 2));
      
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
      
      return volunteers.map((vol) => ({
        organization: vol.organization || vol.company || vol.org || '',
        role: vol.role || vol.title || vol.position || '',
        description: vol.description || '',
        start_date: vol.start_date || vol.startDate || '',
        end_date: vol.end_date || vol.endDate || '',
        date: vol.date || `${vol.start_date || vol.startDate || ''} - ${vol.end_date || vol.endDate || ''}`,
        cause: vol.cause || vol.category || '',
      }));
    };

    const extractedVolunteers = extractVolunteer(mockLinkedInResponse);
    console.log('Extracted volunteers:', JSON.stringify(extractedVolunteers, null, 2));

    console.log('\n=== Testing Honors & Awards Extraction ===');
    
    // Test honors & awards extraction
    const extractHonorsAwards = (data) => {
      console.log('Raw honors/awards data:', JSON.stringify(data.honors_awards || [], null, 2));
      
      const honors = [];
      
      if (data.honors && Array.isArray(data.honors)) {
        honors.push(...data.honors);
      }
      
      if (data.awards && Array.isArray(data.awards)) {
        honors.push(...data.awards);
      }
      
      if (data.accomplishments && Array.isArray(data.accomplishments)) {
        honors.push(...data.accomplishments);
      }
      
      if (data.honors_awards && Array.isArray(data.honors_awards)) {
        honors.push(...data.honors_awards);
      }
      
      if (data.achievements && Array.isArray(data.achievements)) {
        honors.push(...data.achievements);
      }
      
      return honors.map((honor) => ({
        title: honor.title || honor.name || '',
        issuer: honor.issuer || honor.authority || honor.organization || '',
        date: honor.date || honor.issued || `${honor.start_date || ''} - ${honor.end_date || ''}`,
        description: honor.description || '',
        url: honor.url || '',
      }));
    };

    const extractedHonors = extractHonorsAwards(mockLinkedInResponse);
    console.log('Extracted honors & awards:', JSON.stringify(extractedHonors, null, 2));

    console.log('\n=== Testing Empty Data Handling ===');
    
    // Test with empty data
    const emptyData = {};
    const emptyCertifications = extractCertifications(emptyData);
    const emptyVolunteers = extractVolunteer(emptyData);
    const emptyHonors = extractHonorsAwards(emptyData);
    
    console.log('Empty certifications result:', JSON.stringify(emptyCertifications, null, 2));
    console.log('Empty volunteers result:', JSON.stringify(emptyVolunteers, null, 2));
    console.log('Empty honors result:', JSON.stringify(emptyHonors, null, 2));

    console.log('\n=== All Tests Completed Successfully! ===');

  } catch (error) {
    console.error('Error in tests:', error);
  }
}

testLinkedInExtractions();
