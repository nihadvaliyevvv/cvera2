// Simple test to check CV table access
const { PrismaClient } = require('@prisma/client');

async function testCVTable() {
  console.log('Starting CV table test...');
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing CV table access...');
    
    // Check what models are available
    console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('$')));
    
    // Try to query CV table
    const cvCount = await prisma.cv.count();
    console.log('CV count:', cvCount);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCVTable().catch(console.error);
