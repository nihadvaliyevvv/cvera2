"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linkedin_scraper_1 = require("./src/lib/scraper/linkedin-scraper");
async function testManualLinkedInScraping() {
    try {
        console.log('🧪 Manuel LinkedIn scraping test başlayır...');
        console.log('📋 Browser açılacaq - manual olaraq LinkedIn-ə giriş edin');
        console.log('⏰ Giriş etdikdən sonra sistem avtomatik olaraq profil məlumatlarını çıxaracaq');
        console.log('');
        const profileData = await (0, linkedin_scraper_1.scrapeLinkedInProfileWithManualLogin)();
        console.log('');
        console.log('✅ Profil məlumatları uğurla əldə edildi!');
        console.log('📊 Profil məlumatları:');
        console.log(JSON.stringify(profileData, null, 2));
    }
    catch (error) {
        console.error('❌ Test uğursuz:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
}
testManualLinkedInScraping();
