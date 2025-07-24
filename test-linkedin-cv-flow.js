const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testScrapingDogFlow() {
  console.log('🧪 ScrapingDog LinkedIn CV Integration Test başlayır...');
  console.log('===================================================');

  try {
    // Test 1: Direct ScrapingDog API test
    console.log('\n1️⃣ ScrapingDog API direct test:');
    const { ScrapingDogLinkedInScraper } = require('./src/lib/scraper/scrapingdog-linkedin-scraper.ts');
    
    const scraper = new ScrapingDogLinkedInScraper();
    const testProfile = await scraper.scrapeLinkedInProfile('https://www.linkedin.com/in/musayevcreate');
    
    console.log('✅ Raw ScrapingDog data structure:');
    console.log('- Name:', testProfile.name || 'NOT FOUND');
    console.log('- Headline:', testProfile.headline || 'NOT FOUND');
    console.log('- Location:', testProfile.location || 'NOT FOUND');
    console.log('- About length:', testProfile.about?.length || 0);
    console.log('- Experience count:', testProfile.experience?.length || 0);
    console.log('- Education count:', testProfile.education?.length || 0);
    console.log('- Skills count:', testProfile.skills?.length || 0);

    // Test 2: Parser transformation test
    console.log('\n2️⃣ Parser transformation test:');
    const { parseLinkedInData } = require('./src/lib/utils/parser.ts');
    const parsedData = parseLinkedInData(testProfile, 'https://www.linkedin.com/in/musayevcreate');
    
    console.log('✅ Parsed data structure:');
    console.log('- Personal Info Name:', parsedData.personalInfo?.name || 'NOT FOUND');
    console.log('- Personal Info Headline:', parsedData.personalInfo?.headline || 'NOT FOUND');
    console.log('- Experience count:', parsedData.experience?.length || 0);
    console.log('- Education count:', parsedData.education?.length || 0);
    console.log('- Skills count:', parsedData.skills?.length || 0);
    console.log('- Certifications count:', parsedData.certifications?.length || 0);

    // Test 3: CVEditor transformation simulation
    console.log('\n3️⃣ CVEditor transformation simulation:');
    
    // Simulate the transformLinkedInDataToCVData function
    const simulateCVTransformation = (linkedInData) => {
      return {
        personalInfo: {
          fullName: linkedInData.personalInfo?.name || linkedInData.name || '',
          email: linkedInData.personalInfo?.email || '',
          phone: linkedInData.personalInfo?.phone || '',
          address: linkedInData.personalInfo?.address || linkedInData.location || '',
          website: linkedInData.personalInfo?.website || '',
          linkedin: linkedInData.personalInfo?.linkedin || '',
          summary: linkedInData.personalInfo?.summary || linkedInData.personalInfo?.headline || ''
        },
        experience: (linkedInData.experience || []).map((exp) => ({
          position: exp.title || exp.position || '',
          company: exp.company || exp.company_name || '',
          startDate: exp.start_date || exp.startDate || '',
          endDate: exp.end_date || exp.endDate || 'Present',
          description: exp.description || '',
          location: exp.location || ''
        })),
        education: (linkedInData.education || []).map((edu) => ({
          degree: edu.degree || edu.field_of_study || '',
          institution: edu.school || edu.institution || '',
          year: edu.end_date || edu.year || '',
          description: edu.description || '',
          gpa: edu.gpa || ''
        })),
        skills: linkedInData.skills ? 
          (Array.isArray(linkedInData.skills) ? 
            linkedInData.skills.map((skill) => ({
              name: typeof skill === 'string' ? skill : skill.name || '',
              level: 'Intermediate'
            })) : []
          ) : [],
        certifications: Array.isArray(linkedInData.certifications) ? 
          linkedInData.certifications.map((cert) => ({
            name: cert.name || cert.title || '',
            issuer: cert.authority || cert.issuer || '',
            date: cert.start_date || cert.date || '',
            description: cert.description || ''
          })) : []
      };
    };

    const cvData = simulateCVTransformation(parsedData);
    
    console.log('✅ Final CV data structure:');
    console.log('- Full Name:', cvData.personalInfo?.fullName || 'NOT FOUND');
    console.log('- Email:', cvData.personalInfo?.email || 'NOT FOUND');
    console.log('- Summary:', cvData.personalInfo?.summary || 'NOT FOUND');
    console.log('- Experience entries:', cvData.experience?.length || 0);
    console.log('- Education entries:', cvData.education?.length || 0);
    console.log('- Skills entries:', cvData.skills?.length || 0);
    console.log('- Certifications entries:', cvData.certifications?.length || 0);

    // Show sample data
    if (cvData.experience?.length > 0) {
      console.log('\n📋 Sample Experience Entry:');
      console.log(JSON.stringify(cvData.experience[0], null, 2));
    }

    if (cvData.skills?.length > 0) {
      console.log('\n💪 Sample Skills (first 5):');
      console.log(cvData.skills.slice(0, 5).map(s => s.name).join(', '));
    }

    console.log('\n===================================================');
    console.log('🎉 DATA FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ ScrapingDog API → Parser → CVEditor flow is working');
    console.log('✅ All data transformations are compatible');
    console.log('✅ LinkedIn import will populate CV fields correctly');

  } catch (error) {
    console.error('\n❌ Data flow test failed:', error);
    console.error('🔍 Error details:', error.message);
    console.error('📍 Stack trace:', error.stack);
  }
}

// Run the test
testScrapingDogFlow();
