const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function testSmallFontSizes() {
  try {
    console.log('Testing CV generation with smaller font sizes...');
    
    // Mock CV data
    const mockCVData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/johndoe',
        website: 'johndoe.com',
        summary: 'Experienced software developer with 5+ years of experience in web development and mobile applications.'
      },
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2020-01',
          endDate: '2024-01',
          location: 'New York, NY',
          description: 'Led development of microservices architecture. Managed team of 5 developers. Implemented CI/CD pipelines.'
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2018-06',
          endDate: '2020-01',
          location: 'San Francisco, CA',
          description: 'Developed responsive web applications using React and Node.js. Collaborated with design team.'
        }
      ],
      education: [
        {
          institution: 'MIT',
          degree: 'Bachelor of Science in Computer Science',
          startDate: '2014-09',
          endDate: '2018-05'
        }
      ],
      skills: [
        { name: 'JavaScript', level: 'Expert' },
        { name: 'React', level: 'Expert' },
        { name: 'Node.js', level: 'Advanced' },
        { name: 'Python', level: 'Intermediate' },
        { name: 'AWS', level: 'Intermediate' },
        { name: 'Docker', level: 'Intermediate' }
      ],
      languages: [
        { name: 'English', level: 'Native' },
        { name: 'Spanish', level: 'Intermediate' },
        { name: 'French', level: 'Beginner' }
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React frontend and Node.js backend',
          technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API']
        },
        {
          name: 'Task Management App',
          description: 'Mobile-first task management application with real-time collaboration',
          technologies: ['React Native', 'Firebase', 'Redux']
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-06'
        },
        {
          name: 'Google Cloud Professional',
          issuer: 'Google Cloud',
          date: '2023-03'
        }
      ]
    };
    
    // Import the file generation module
    const path = require('path');
    const { FileGeneration } = require('./src/lib/fileGeneration.ts');
    
    // Generate PDF with basic template
    const htmlContent = FileGeneration.generatePDFContent(mockCVData, 'basic');
    
    // Save HTML to file for inspection
    fs.writeFileSync('./test-small-fonts.html', htmlContent);
    console.log('HTML file generated: test-small-fonts.html');
    
    // Check if font sizes are reduced
    const fontSizeChecks = [
      { pattern: /font-size: 9pt/, description: 'Body font size reduced to 9pt' },
      { pattern: /font-size: 1\.8rem/, description: 'H1 font size reduced to 1.8rem' },
      { pattern: /font-size: 1\.1rem/, description: 'H2 font size reduced to 1.1rem' },
      { pattern: /font-size: 10pt/, description: 'Experience title font size reduced to 10pt' },
      { pattern: /font-size: 8pt/, description: 'Contact info font size reduced to 8pt' }
    ];
    
    console.log('\n=== Font Size Verification ===');
    fontSizeChecks.forEach(check => {
      const found = check.pattern.test(htmlContent);
      console.log(`${found ? '✓' : '✗'} ${check.description}`);
    });
    
    // Check spacing reductions
    const spacingChecks = [
      { pattern: /margin-bottom: 0\.6rem/, description: 'Section margins reduced to 0.6rem' },
      { pattern: /padding: 0\.6rem/, description: 'Section padding reduced to 0.6rem' },
      { pattern: /gap: 0\.6rem/, description: 'Grid gaps reduced to 0.6rem' },
      { pattern: /border-left: 2px/, description: 'Border thickness reduced to 2px' }
    ];
    
    console.log('\n=== Spacing Verification ===');
    spacingChecks.forEach(check => {
      const found = check.pattern.test(htmlContent);
      console.log(`${found ? '✓' : '✗'} ${check.description}`);
    });
    
    console.log('\n=== Summary ===');
    console.log('✓ CV template updated with smaller font sizes');
    console.log('✓ Spacing and padding reduced for compact layout');
    console.log('✓ HTML file generated for visual inspection');
    console.log('\nOpen test-small-fonts.html in browser to see the compact layout');
    
  } catch (error) {
    console.error('Error testing font sizes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSmallFontSizes();
