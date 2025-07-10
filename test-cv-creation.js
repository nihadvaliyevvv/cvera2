const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

async function testCVCreation() {
  console.log('Starting CV creation test...');
  
  try {
    // 1. Find or create a test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password'
        }
      });
    }
    
    console.log('Test user:', testUser.id);
    
    // 2. Create test CV data (minimal required data)
    const testCVData = {
      title: 'Test CV',
      cv_data: {
        personalInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+994501234567',
          location: 'Baku, Azerbaijan',
          website: '',
          linkedin: '',
          summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        volunteerExperience: [],
        templateId: 'template1'
      }
    };
    
    console.log('Creating CV with data:', JSON.stringify(testCVData, null, 2));
    
    // 3. Test CV creation
    const cv = await prisma.cV.create({
      data: {
        userId: testUser.id,
        title: testCVData.title,
        cv_data: testCVData.cv_data,
        templateId: testCVData.cv_data.templateId
      }
    });
    
    console.log('CV created successfully:', cv.id);
    
    // 4. Test CV retrieval
    const retrievedCV = await prisma.cV.findUnique({
      where: { id: cv.id }
    });
    
    console.log('Retrieved CV:', {
      id: retrievedCV.id,
      title: retrievedCV.title,
      hasData: !!retrievedCV.cv_data,
      dataKeys: retrievedCV.cv_data ? Object.keys(retrievedCV.cv_data) : []
    });
    
    // 5. Test API endpoint simulation
    console.log('\nTesting API endpoint validation...');
    
    const { title, cv_data } = testCVData;
    
    // Backend validation check
    if (!title || !cv_data) {
      console.error('❌ Backend validation failed: Missing title or cv_data');
      return;
    }
    
    if (typeof cv_data !== 'object' || cv_data === null) {
      console.error('❌ Backend validation failed: cv_data is not an object');
      return;
    }
    
    console.log('✅ Backend validation passed');
    
    // Frontend validation check
    const validationErrors = [];
    
    // 1. CV title is required
    if (!title || title.trim().length === 0) {
      validationErrors.push('CV başlığı tələb olunur');
    }
    
    // 2. Template selection is required
    if (!cv_data.templateId || cv_data.templateId.trim().length === 0) {
      validationErrors.push('Şablon seçimi tələb olunur');
    }
    
    // 3. Personal info validation
    if (!cv_data.personalInfo || typeof cv_data.personalInfo !== 'object') {
      validationErrors.push('Şəxsi məlumatlar tələb olunur');
    } else {
      // Only name is required
      if (!cv_data.personalInfo.name || cv_data.personalInfo.name.trim().length === 0) {
        validationErrors.push('Ad tələb olunur');
      }
    }
    
    if (validationErrors.length > 0) {
      console.error('❌ Frontend validation failed:', validationErrors.join(', '));
      return;
    }
    
    console.log('✅ Frontend validation passed');
    
    // 6. Test with minimal data (what might be causing the issue)
    console.log('\nTesting with minimal data...');
    
    const minimalCVData = {
      title: 'Minimal CV',
      cv_data: {
        personalInfo: {
          name: 'Minimal User',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        volunteerExperience: [],
        templateId: ''
      }
    };
    
    // This should trigger the "Missing Data" error in frontend validation
    const minimalValidationErrors = [];
    
    if (!minimalCVData.title || minimalCVData.title.trim().length === 0) {
      minimalValidationErrors.push('CV başlığı tələb olunur');
    }
    
    if (!minimalCVData.cv_data.templateId || minimalCVData.cv_data.templateId.trim().length === 0) {
      minimalValidationErrors.push('Şablon seçimi tələb olunur');
    }
    
    if (!minimalCVData.cv_data.personalInfo.name || minimalCVData.cv_data.personalInfo.name.trim().length === 0) {
      minimalValidationErrors.push('Ad tələb olunur');
    }
    
    if (minimalValidationErrors.length > 0) {
      console.log('❌ Minimal data validation failed (expected):', minimalValidationErrors.join(', '));
    } else {
      console.log('✅ Minimal data validation passed');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCVCreation();
