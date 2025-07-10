import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLinkedInImport() {
  console.log('Testing LinkedIn Import with Database-Managed API Keys...');
  
  // Test the LinkedIn import endpoint
  try {
    const response = await fetch('http://localhost:3001/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        url: 'https://www.linkedin.com/in/test-profile'
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if API keys are being used from database
    const keys = await prisma.apiKey.findMany({
      orderBy: { priority: 'asc' }
    });
    
    console.log('\nAPI Keys usage status:');
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name} - Last used: ${key.lastUsed || 'Never'} - Usage count: ${key.usageCount} - Last result: ${key.lastResult || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('Error testing LinkedIn import:', error);
  }
  
  await prisma.$disconnect();
}

testLinkedInImport().catch(console.error);
