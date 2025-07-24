#!/usr/bin/env node

/**
 * Simple Skills Debug Test
 * Yalnız skills məsələsini debug etmək üçün
 */

const axios = require('axios');

const API_KEY = '6882894b855f5678d36484c8';
const BASE_URL = 'https://api.scrapingdog.com/linkedin';

async function debugSkills() {
  console.log('🔍 Skills debug testi...\n');
  
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        type: 'profile',
        linkId: 'musayevcreate',
        premium: 'false',
        fields: 'name,headline,skills'  // Yalnız skills-i test et
      },
      timeout: 30000,
    });

    if (response.status === 200) {
      const data = response.data;
      const profile = Array.isArray(data) ? data[0] : data;
      
      console.log('📊 Raw API Response:');
      console.log(JSON.stringify(profile, null, 2));
      
      console.log('\n🔍 Skills Analysis:');
      console.log('Skills sahəsi mövcud?', profile.skills ? 'BƏLİ' : 'XEYR');
      
      if (profile.skills) {
        console.log('Skills tipi:', typeof profile.skills);
        console.log('Skills array?', Array.isArray(profile.skills));
        console.log('Skills sayı:', profile.skills.length || 'N/A');
        console.log('İlk skill:', profile.skills[0]);
        console.log('Skills formatı:', profile.skills);
      }
      
      // Digər possible skill field names
      console.log('\n🔎 Digər mümkün sahələr:');
      Object.keys(profile).forEach(key => {
        if (key.toLowerCase().includes('skill')) {
          console.log(`${key}:`, profile[key]);
        }
      });
      
    } else {
      console.log('❌ API xətası:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
  }
}

debugSkills();
