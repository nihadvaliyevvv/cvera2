const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBoldTemplate() {
  try {
    // Test data
    const testCV = {
      personalInfo: {
        fullName: 'Tim Jobs',
        title: 'Senior Software Engineer',
        email: 'tim.jobs@gmail.com',
        phone: '1122334455',
        website: 'www.timjobs.com',
        location: 'San Francisco, CA',
        summary: '6+ years of experience in creating scalable web applications using Java. Proficient with Hadoop & Python. Algorithms & Machine Learning Enthusiast.'
      },
      experience: [
        {
          company: 'eBay',
          position: 'Senior Software Engineer',
          startDate: 'October 2012',
          endDate: 'Present',
          description: '• Released inhouse warehouse management system using J2EE stack facilitating realtime inventory counts, inventory location tracking, multi-warehouse workflows and order picking path optimization\n• Proactively solved problems like horizontal scalability, concurrency control, read-write segregation, database optimizations etc. leading to recognition from Senior Management\n• Core team member for eBay\'s open source distributed analytics engine - Kylin.'
        },
        {
          company: 'Amazon',
          position: 'Software Development Engineer II',
          startDate: 'August 2010',
          endDate: 'October 2012',
          description: '• Redesigned and developed from scratch components of space management systems for Amazon fulfillment centers (warehouses)\n• Integrated a file transfer utility in internal system which manages quick transfer of large files across several hosts. Optimized it to provide 40% faster transfers'
        }
      ],
      education: [
        {
          institution: 'University of California, Los Angeles',
          degree: 'Bachelor of Science (BS), Computer Science',
          startDate: '2006',
          endDate: '2010',
          gpa: '3.8'
        }
      ],
      skills: [
        { name: 'Java' },
        { name: 'C++' },
        { name: 'Hadoop' },
        { name: 'Python' },
        { name: 'Spring' },
        { name: 'Hibernate' }
      ],
      languages: [
        { name: 'English', level: 'Native' },
        { name: 'Spanish', level: 'Intermediate' }
      ]
    };

    // Get templates
    const templates = await prisma.template.findMany();
    console.log('📋 Available templates:');
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.tier}) - ID: ${template.id}`);
    });

    // Find Bold template
    const boldTemplate = templates.find(t => t.name === 'Bold');
    console.log('\n🎨 Bold template found:', boldTemplate?.id);

    console.log('\n✅ Test data prepared for Bold template!');
    console.log('📄 Template features:');
    console.log('- Large uppercase name');
    console.log('- Contact info in table format');
    console.log('- Bold section headers');
    console.log('- Company name prominent');
    console.log('- Clean bullet points');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBoldTemplate();
