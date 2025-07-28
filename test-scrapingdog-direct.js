const axios = require('axios');

const api_key = '6882894b855f5678d36484c8';
const url = 'https://api.scrapingdog.com/linkedin';

const params = {
  api_key: api_key,
  type: 'profile',
  linkId: 'musayevcreate',
  premium: 'false',
};

console.log('Testing ScrapingDog API with your LinkedIn username...');
console.log('URL:', url);
console.log('Params:', params);

axios
  .get(url, { params: params })
  .then(function (response) {
    if (response.status === 200) {
      const data = response.data;
      console.log('✅ SUCCESS! Response received:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Request failed with status code: ' + response.status);
    }
  })
  .catch(function (error) {
    console.error('❌ Error making the request:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  });
