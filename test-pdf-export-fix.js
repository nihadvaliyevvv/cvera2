// Test PDF export with Vercel fixes
const { PrismaClient } = require('@prisma/client');
const FileGenerationService = require('./src/lib/fileGeneration.ts').default;

const prisma = new PrismaClient();

async function testPDFExport() {
  console.log('🚀 Testing PDF export with Vercel fixes...\n');
  
  try {
    // Test CV data
    const testCVData = {
      personalInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+994 50 123 45 67',
        location: 'Baku, Azerbaijan',
        summary: 'Test CV summary for PDF export testing.'
      },
      experience: [
        {
          position: 'Software Developer',
          company: 'Test Company',
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          description: 'Test job description for PDF export.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'Test University',
          startDate: '2019-09-01',
          endDate: '2023-06-01'
        }
      ],
      skills: [
        { name: 'JavaScript', level: 'Advanced' },
        { name: 'React', level: 'Intermediate' }
      ],
      languages: [
        { language: 'Azerbaijani', level: 'Native' },
        { language: 'English', level: 'Fluent' }
      ]
    };

    console.log('1. Testing PDF generation...');
    
    // Test environment detection
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    console.log(`   Environment: ${isVercel ? 'Vercel' : 'Local'}`);
    
    // Generate PDF
    const pdfBuffer = await FileGenerationService.generateFile({
      format: 'pdf',
      cvData: testCVData,
      templateId: 'basic'
    });
    
    console.log('✅ PDF generation successful!');
    console.log(`   PDF size: ${pdfBuffer.length} bytes`);
    
    // Save PDF for inspection
    const fs = require('fs');
    const path = require('path');
    const pdfPath = path.join(__dirname, 'test-vercel-export.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    console.log(`   PDF saved to: ${pdfPath}`);
    
  } catch (error) {
    console.error('❌ PDF export test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('Could not find Chromium')) {
      console.log('\n💡 Chromium not found. This is expected in Vercel deployment.');
      console.log('   The fix should resolve this issue in production.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPDFExport();
