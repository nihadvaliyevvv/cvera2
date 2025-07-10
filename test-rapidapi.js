const axios = require('axios');

async function testRapidAPI() {
  const API_KEY = 'cb32882898msh7025ca432cb5588p1bfb73jsn86ca5a83c21b';
  const API_HOST = 'fresh-linkedin-profile-data.p.rapidapi.com';
  const TEST_URL = 'https://linkedin.com/in/williamhgates';

  console.log('Testing RapidAPI connection...');
  console.log('API Host:', API_HOST);
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('Test URL:', TEST_URL);

  try {
    const response = await axios.get(
      `https://${API_HOST}/get-linkedin-profile`,
      {
        params: { linkedin_url: TEST_URL },
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST,
        },
        timeout: 30000,
      }
    );

    console.log('SUCCESS! Status:', response.status);
    console.log('Response data keys:', Object.keys(response.data || {}));
    
    if (response.data && response.data.data) {
      console.log('Profile data keys:', Object.keys(response.data.data));
      console.log('Profile name:', response.data.data.full_name);
    }
  } catch (error) {
    console.error('FAILED! Error details:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Error Data:', error.response.data);
    } else if (error.code) {
      console.log('Network Error Code:', error.code);
      console.log('Error Message:', error.message);
    } else {
      console.log('Unknown Error:', error.message);
    }
  }
}

testRapidAPI();
