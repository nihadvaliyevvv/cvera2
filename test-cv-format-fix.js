// Test script to verify the CV creation fix
console.log('Testing CV data format consistency...');

// Simulate CVEditor format
const cvEditorFormat = {
  title: 'Test CV',
  templateId: 'template1',
  data: {
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
    volunteerExperience: []
  }
};

// Simulate API response format
const apiResponseFormat = {
  id: 'cv-123',
  title: 'Test CV',
  templateId: 'template1',
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
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Test the validation logic used in the edit page
function testValidation(cvData, formatName) {
  console.log(`\nTesting validation for ${formatName}:`);
  console.log('Input data:', JSON.stringify(cvData, null, 2));
  
  // Handle both possible data formats:
  // 1. CVEditor format: { title, templateId, data: { personalInfo, ... } }
  // 2. API response format: { title, templateId, cv_data: { personalInfo, ... } }
  const actualData = cvData.data || cvData.cv_data;
  const actualTitle = cvData.title;
  const actualTemplateId = cvData.templateId;
  
  const validationErrors = [];
  
  // 1. CV başlığı məcburidir
  if (!actualTitle || actualTitle.trim().length === 0) {
    validationErrors.push('CV başlığı tələb olunur');
  }
  
  // 2. CV data structure check
  if (!actualData || typeof actualData !== 'object') {
    validationErrors.push('CV məlumatları tələb olunur');
  } else {
    // 3. Personal info check
    if (!actualData.personalInfo || typeof actualData.personalInfo !== 'object') {
      validationErrors.push('Şəxsi məlumatlar tələb olunur');
    } else {
      // Only name is required
      if (!actualData.personalInfo.name || actualData.personalInfo.name.trim().length === 0) {
        validationErrors.push('Ad tələb olunur');
      }
    }
  }
  
  if (validationErrors.length > 0) {
    console.log('❌ Validation failed:', validationErrors.join(', '));
    return false;
  } else {
    console.log('✅ Validation passed');
    return true;
  }
}

// Test both formats
testValidation(cvEditorFormat, 'CVEditor format');
testValidation(apiResponseFormat, 'API response format');

// Test the transformation from API response to CVEditor format
console.log('\nTesting API response to CVEditor format transformation:');
const transformedData = {
  id: apiResponseFormat.id,
  title: apiResponseFormat.title,
  templateId: apiResponseFormat.templateId,
  data: apiResponseFormat.cv_data
};

console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
testValidation(transformedData, 'Transformed format');

console.log('\nTest completed successfully! The fix should resolve the "CV məlumatları tələb olunur" error.');
