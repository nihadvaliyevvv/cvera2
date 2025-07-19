const { PrismaClient } = require('@prisma/client');

const testDB = async () => {
  console.log('🔌 Database Connection Test');
  console.log('===========================');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible, ${userCount} users found`);
    
    // Test user creation (dry run)
    console.log('Testing user creation...');
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (testUser) {
      console.log('✅ Test user already exists:', testUser.email);
    } else {
      console.log('ℹ️  Test user does not exist (normal)');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    // More specific error details
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
};

testDB();
