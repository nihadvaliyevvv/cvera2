const axios = require('axios');

const api_key = '6882894b855f5678d36484c8';
const url = 'https://api.scrapingdog.com/linkedin';

const params = {
  api_key: api_key,
  type: 'profile',
  linkId: 'musayevcreate',
  premium: 'false',
};

axios
  .get(url, { params: params })
  .then(function (response) {
    if (response.status === 200) {
      const data = response.data;

      console.log('🔍 Full ScrapingDog Response:');
      console.log(JSON.stringify(data, null, 2));

      // Check experience data specifically
      if (data && data.experience) {
        console.log('\n💼 Experience Data Analysis:');
        data.experience.forEach((exp, index) => {
          console.log(`\nExperience ${index + 1}:`);
          console.log('Title:', exp.title || exp.position);
          console.log('Company:', exp.company || exp.company_name);
          console.log('Duration:', exp.duration);
          console.log('Start Date:', exp.start_date || exp.starts_at);
          console.log('End Date:', exp.end_date || exp.ends_at);
          console.log('All fields:', Object.keys(exp));
        });
      }

      // Check volunteer data specifically
      if (data && data.volunteering) {
        console.log('\n❤️ Volunteer Data Analysis:');
        data.volunteering.forEach((vol, index) => {
          console.log(`\nVolunteer ${index + 1}:`);
          console.log('Organization:', vol.organization || vol.company);
          console.log('Role:', vol.role || vol.position);
          console.log('Duration:', vol.duration);
          console.log('All fields:', Object.keys(vol));
        });
      }

    } else {
      console.log('Request failed with status code: ' + response.status);
    }
  })
  .catch(function (error) {
    console.error('Error making the request: ' + error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  });
