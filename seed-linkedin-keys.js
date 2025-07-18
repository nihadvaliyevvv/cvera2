const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLinkedInApiKeys() {
  try {
    console.log('🔄 Adding LinkedIn API keys...');
    
    // Clear existing API keys
    await prisma.apiKey.deleteMany({ where: { service: 'linkedin' } });
    
    // Real LinkedIn API keys from admin-seed
    const apiKeys = [
      {
        name: 'LinkedIn API Key 1',
        key: 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4',
        service: 'linkedin',
        priority: 0,
        active: true,
      },
      {
        name: 'LinkedIn API Key 2',
        key: '75cb08f9a5mshb09ff64b9fb4646p1b98a8jsnc533bdee4c87',
        service: 'linkedin',
        priority: 1,
        active: true,
      },
      {
        name: 'LinkedIn API Key 3',
        key: 'e5784e5bd5msh824674fccf1cdd7p1c3067jsn4d38281849b1',
        service: 'linkedin',
        priority: 2,
        active: true,
      },
      {
        name: 'LinkedIn API Key 4',
        key: 'c606ec5754mshad43ac7b61cf986p1ff797jsne57f78153b99',
        service: 'linkedin',
        priority: 3,
        active: true,
      },
      {
        name: 'LinkedIn API Key 5',
        key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
        service: 'linkedin',
        priority: 4,
        active: true,
      },
    ];

    for (const keyData of apiKeys) {
      const apiKey = await prisma.apiKey.create({
        data: keyData
      });
      console.log(`✅ Created API key: ${apiKey.name}`);
    }

    console.log(`\n📊 Total ${apiKeys.length} LinkedIn API keys added successfully!`);
    
  } catch (error) {
    console.error('❌ Error adding API keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLinkedInApiKeys();
