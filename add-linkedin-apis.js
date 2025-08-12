const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addLinkedInApis() {
  try {
    console.log('🔑 Adding LinkedIn scraping APIs to database...');

    // Add BrightData API (Primary)
    const brightDataKey = await prisma.apiKey.upsert({
      where: {
        service_apiKey: {
          service: 'brightdata',
          apiKey: 'da77d05e80aa038856c04cb0e96d34a267be39e89a46c03ed15e68b38353eaae'
        }
      },
      update: {
        active: true,
        priority: 1,
        dailyLimit: 1000
      },
      create: {
        service: 'brightdata',
        apiKey: 'da77d05e80aa038856c04cb0e96d34a267be39e89a46c03ed15e68b38353eaae',
        active: true,
        priority: 1,
        dailyLimit: 1000,
        usageCount: 0,
        dailyUsage: 0,
        lastResult: null
      }
    });

    console.log('✅ BrightData API added/updated:', {
      id: brightDataKey.id,
      service: brightDataKey.service,
      active: brightDataKey.active,
      priority: brightDataKey.priority
    });

    // Add RapidAPI for skills (Secondary)
    const rapidApiKey = await prisma.apiKey.upsert({
      where: {
        service_apiKey: {
          service: 'rapidapi',
          apiKey: process.env.RAPIDAPI_KEY || 'your-rapidapi-key'
        }
      },
      update: {
        active: true,
        priority: 2,
        dailyLimit: 500
      },
      create: {
        service: 'rapidapi',
        apiKey: process.env.RAPIDAPI_KEY || 'your-rapidapi-key',
        active: true,
        priority: 2,
        dailyLimit: 500,
        usageCount: 0,
        dailyUsage: 0,
        lastResult: null
      }
    });

    console.log('✅ RapidAPI added/updated:', {
      id: rapidApiKey.id,
      service: rapidApiKey.service,
      active: rapidApiKey.active,
      priority: rapidApiKey.priority
    });

    // Deactivate any remaining ScrapingDog entries
    await prisma.apiKey.updateMany({
      where: {
        service: {
          in: ['scrapingdog', 'scrapingdog_linkedin']
        }
      },
      data: {
        active: false,
        priority: 999
      }
    });

    console.log('🚫 ScrapingDog APIs deactivated');

    // Get summary
    const activeKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        service: {
          in: ['brightdata', 'rapidapi']
        }
      },
      orderBy: {
        priority: 'asc'
      }
    });

    console.log('\n📊 Active LinkedIn APIs:');
    activeKeys.forEach(key => {
      console.log(`  ${key.priority}. ${key.service} - ${key.apiKey.substring(0, 8)}...`);
    });

    console.log('\n✅ LinkedIn API setup complete - ONLY BrightData + RapidAPI');

  } catch (error) {
    console.error('❌ Error adding LinkedIn APIs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addLinkedInApis();
