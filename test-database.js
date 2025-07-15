const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing PostgreSQL database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    const templateCount = await prisma.template.count();
    console.log(`✅ Found ${templateCount} templates in database`);
    
    const apiKeyCount = await prisma.apiKey.count();
    console.log(`✅ Found ${apiKeyCount} API keys in database`);
    
    // Test creating a test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password'
      }
    });
    console.log(`✅ Created test user: ${testUser.name} (ID: ${testUser.id})`);
    
    // Test creating a test CV
    const testCV = await prisma.cV.create({
      data: {
        userId: testUser.id,
        title: 'Test CV',
        cv_data: {
          personalInfo: {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '+994501234567',
            location: 'Baku, Azerbaijan'
          },
          experience: [],
          education: [],
          skills: [],
          languages: []
        }
      }
    });
    console.log(`✅ Created test CV: ${testCV.title} (ID: ${testCV.id})`);
    
    // Clean up test data
    await prisma.cV.delete({ where: { id: testCV.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Cleaned up test data');
    
    console.log('\n🎉 All PostgreSQL database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
