const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication system...');
    
    // Test database connection
    console.log('📊 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@cvera.com' }
    });
    
    if (adminUser) {
      console.log('🔑 Admin user found:');
      console.log(`   - Name: ${adminUser.name}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      
      // Test password verification
      const testPassword = 'admin123';
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`🔐 Admin password test (admin123): ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test JWT secrets
    console.log('🔑 Testing JWT configuration...');
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    
    if (JWT_SECRET && JWT_REFRESH_SECRET) {
      console.log('✅ JWT secrets are configured');
    } else {
      console.log('❌ JWT secrets missing');
      console.log(`   - JWT_SECRET: ${JWT_SECRET ? 'Set' : 'Missing'}`);
      console.log(`   - JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET ? 'Set' : 'Missing'}`);
    }
    
    // Test BCRYPT_ROUNDS
    const bcryptRounds = process.env.BCRYPT_ROUNDS || '12';
    console.log(`🔐 BCRYPT_ROUNDS: ${bcryptRounds}`);
    
    console.log('🎉 Authentication test completed');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
