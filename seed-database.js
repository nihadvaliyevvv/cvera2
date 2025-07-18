const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🔄 Seeding database (excluding templates)...');
    
    // 1. Create API keys for LinkedIn scraping
    console.log('📝 Creating API keys...');
    
    // Clear existing API keys first
    await prisma.apiKey.deleteMany();
    
    const apiKeys = [
      { 
        name: 'Primary LinkedIn API Key', 
        key: 'primary-api-key-active', 
        active: true,
        service: 'linkedin',
        priority: 1,
        usageCount: 0
      },
      { 
        name: 'Secondary LinkedIn API Key', 
        key: 'secondary-api-key-backup', 
        active: true,
        service: 'linkedin',
        priority: 2,
        usageCount: 0
      },
      { 
        name: 'Test API Key', 
        key: 'test-api-key-development', 
        active: false,
        service: 'linkedin',
        priority: 0,
        usageCount: 0
      }
    ];

    for (const apiKey of apiKeys) {
      await prisma.apiKey.create({
        data: apiKey
      });
    }
    
    console.log(`✅ Created ${apiKeys.length} API keys`);
    
    // 2. Check if admin user exists, if not create sample data structure
    console.log('👤 Checking admin setup...');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'admin'
        }
      }
    });
    
    if (adminUsers.length === 0) {
      console.log('ℹ️ No admin users found - this is normal for fresh setup');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s)`);
    }
    
    // 3. Verify templates still exist
    console.log('🔍 Verifying templates...');
    const templates = await prisma.template.findMany();
    console.log(`✅ Found ${templates.length} templates in database`);
    
    if (templates.length === 0) {
      console.log('⚠️ No templates found! Templates should be created separately.');
    }
    
    // 4. Show final summary
    console.log('\n📊 Database seeding complete!');
    console.log('=================================');
    
    const allApiKeys = await prisma.apiKey.findMany();
    const allTemplates = await prisma.template.findMany();
    const allUsers = await prisma.user.findMany();
    
    console.log(`API Keys: ${allApiKeys.length}`);
    console.log(`Templates: ${allTemplates.length}`);
    console.log(`Users: ${allUsers.length}`);
    
    console.log('\n✅ Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
