const axios = require('axios');

// Test LinkedIn certificates import
async function testCertificates() {
  try {
    // Mock LinkedIn API response
    const mockLinkedInResponse = {
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          authority: 'Amazon Web Services',
          date: '2023-01-01',
          url: 'https://aws.amazon.com/certification/',
          license_number: 'AWS-123456'
        },
        {
          name: 'Google Cloud Professional',
          authority: 'Google',
          start_date: '2023-06-01',
          end_date: '2026-06-01',
          credential_id: 'GCP-789012'
        }
      ]
    };

    // Test extraction function
    const extractCertifications = (data) => {
      console.log('Raw certifications data:', JSON.stringify(data.certifications || [], null, 2));
      
      return (data.certifications || []).map((cert) => ({
        name: cert.name || cert.title || '',
        issuer: cert.authority || cert.issuer || cert.organization || '',
        date: cert.date || `${cert.start_date || ''} - ${cert.end_date || ''}`,
        url: cert.url || '',
        license_number: cert.license_number || cert.credential_id || '',
      }));
    };

    const extractedCertifications = extractCertifications(mockLinkedInResponse);
    console.log('Extracted certificates:', JSON.stringify(extractedCertifications, null, 2));

    // Test with empty data
    const emptyData = {};
    const emptyCertifications = extractCertifications(emptyData);
    console.log('Empty data result:', JSON.stringify(emptyCertifications, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testCertificates();
