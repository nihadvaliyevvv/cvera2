const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPDFGeneration() {
  try {
    console.log('🔍 Testing PDF generation...');
    
    // Find a test CV
    const testCV = await prisma.cV.findFirst({
      include: {
        user: true
      }
    });
    
    if (!testCV) {
      console.log('❌ No CV found for testing');
      return;
    }
    
    console.log(`✅ Found test CV: ${testCV.title} (User: ${testCV.user.email})`);
    console.log(`📄 CV Data keys: ${Object.keys(testCV.cv_data || {}).join(', ')}`);
    
    // Test PDF generation endpoint
    const token = 'test-token'; // Bu test üçün
    
    // Simulate FileGenerationService test
    try {
      const FileGenerationService = require('../src/lib/fileGeneration').default;
      
      console.log('🎯 Testing file generation service...');
      
      const fileBuffer = await FileGenerationService.generateFile({
        format: 'pdf',
        cvData: testCV.cv_data,
        templateId: testCV.templateId
      });
      
      console.log(`✅ PDF generated successfully! Size: ${fileBuffer.length} bytes`);
      
    } catch (serviceError) {
      console.error('❌ File generation service error:', serviceError.message);
      console.error('Stack:', serviceError.stack);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPDFGeneration();
