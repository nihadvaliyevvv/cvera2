const { scrapeLinkedInProfile } = require('./src/lib/scraper/linkedin-scraper.ts');

async function testEnhancedScraper() {
  console.log('🚀 Enhanced LinkedIn Scraper Test');
  console.log('================================');
  
  const testUrl = 'https://www.linkedin.com/in/musayevcreate';
  
  try {
    console.log(`🔍 Testing URL: ${testUrl}`);
    console.log('⏳ Starting enhanced HTML scraping...');
    console.log('📋 This will open a browser window for debugging');
    
    const startTime = Date.now();
    const result = await scrapeLinkedInProfile(testUrl);
    const endTime = Date.now();
    
    console.log(`✅ Scraping completed in ${endTime - startTime}ms`);
    console.log('================================');
    
    console.log('📊 EXTRACTED DATA:');
    console.log(`👤 Name: "${result.name || 'NOT FOUND'}"`);
    console.log(`💼 Headline: "${result.headline || 'NOT FOUND'}"`);
    console.log(`📍 Location: "${result.location || 'NOT FOUND'}"`);
    console.log(`📝 About: ${result.about ? `"${result.about.substring(0, 100)}..."` : 'NOT FOUND'}`);
    
    console.log('\n📈 STATISTICS:');
    console.log(`🏢 Experience entries: ${result.experience?.length || 0}`);
    console.log(`🎓 Education entries: ${result.education?.length || 0}`);
    console.log(`🛠️ Skills found: ${result.skills?.length || 0}`);
    
    if (result.experience && result.experience.length > 0) {
      console.log('\n💼 EXPERIENCE:');
      result.experience.forEach((exp, i) => {
        console.log(`${i + 1}. Position: "${exp.position}"`);
        console.log(`   Company: "${exp.company}"`);
        console.log(`   Description: "${exp.description ? exp.description.substring(0, 80) + '...' : 'None'}"`);
        console.log('');
      });
    }
    
    if (result.education && result.education.length > 0) {
      console.log('🎓 EDUCATION:');
      result.education.forEach((edu, i) => {
        console.log(`${i + 1}. School: "${edu.school}"`);
        console.log(`   Degree: "${edu.degree}"`);
        console.log('');
      });
    }
    
    if (result.skills && result.skills.length > 0) {
      console.log(`🛠️ SKILLS: ${result.skills.join(', ')}`);
    }
    
    console.log('\n🎉 Enhanced scraper test completed successfully!');
    
    // Validate results
    const hasBasicInfo = result.name || result.headline || result.about;
    const hasExperience = result.experience && result.experience.length > 0;
    const hasSkills = result.skills && result.skills.length > 0;
    
    console.log('\n📋 VALIDATION:');
    console.log(`✅ Basic Info: ${hasBasicInfo ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ Experience: ${hasExperience ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ Skills: ${hasSkills ? 'FOUND' : 'MISSING'}`);
    
    if (!hasBasicInfo && !hasExperience && !hasSkills) {
      console.log('\n⚠️  WARNING: No data extracted. This could mean:');
      console.log('   - LinkedIn blocked the scraper');
      console.log('   - Profile is private');
      console.log('   - Page structure changed');
      console.log('   - Check the browser window and linkedin-debug.png');
    }
    
  } catch (error) {
    console.error('\n❌ SCRAPER ERROR:');
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    if (error.message.includes('Browser initialization failed')) {
      console.error('\n🔧 SOLUTION: Install Puppeteer - npm install puppeteer');
    } else if (error.message.includes('redirected to login')) {
      console.error('\n🔧 SOLUTION: Profile may be private or LinkedIn detected bot');
    } else if (error.message.includes('timeout')) {
      console.error('\n🔧 SOLUTION: Check internet connection or increase timeout');
    }
  }
}

testEnhancedScraper();
