const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addLinkedInApiKey() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if API key already exists
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d'
      }
    });

    if (existingKey) {
      console.log('✅ API key already exists:', existingKey.id);
      return;
    }

    // Add the working API key
    const apiKey = await prisma.apiKey.create({
      data: {
        key: '736369eb1bmshb2163613ca60219p19ddacjsn320a0db65e0d',
        name: 'Fresh LinkedIn Profile Data',
        service: 'linkedin',
        active: true,
        host: 'fresh-linkedin-profile-data.p.rapidapi.com'
      }
    });

    console.log('✅ API key added successfully:', apiKey);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLinkedInApiKey();
