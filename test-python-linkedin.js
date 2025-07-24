#!/usr/bin/env node

const { scrapeLinkedInProfileWithManualLogin } = require('./src/lib/scraper/python-linkedin-scraper');

async function testPythonLinkedInScraping() {
  try {
    console.log('🧪 Python LinkedIn scraper test başlayır...');
    console.log('📋 Python script browser açacaq - manual giriş lazımdır');
    console.log('⏰ Giriş etdikdən sonra sistem avtomatik olaraq profil məlumatlarını çıxaracaq');
    console.log('');
    
    const profileData = await scrapeLinkedInProfileWithManualLogin();
    
    console.log('');
    console.log('✅ Profil məlumatları uğurla əldə edildi!');
    console.log('📊 Profil məlumatları:');
    console.log(JSON.stringify(profileData, null, 2));
    
  } catch (error) {
    console.error('❌ Test uğursuz:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
}

testPythonLinkedInScraping();
