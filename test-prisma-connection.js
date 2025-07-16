const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: "postgres://admincvera:ilqarilqar1M@cvera.postgres.database.azure.com:5432/postgres?sslmode=require"
});

async function testPrismaConnection() {
  try {
    console.log('🔗 Testing Prisma connection...');
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Prisma connected successfully!');
    console.log('📊 Database version:', result[0].version);
    
    await prisma.$disconnect();
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    console.error('Error code:', error.code);
    await prisma.$disconnect();
  }
}

testPrismaConnection();
