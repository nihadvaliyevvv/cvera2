const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking Azure PostgreSQL database...');
    
    // Check users table
    const users = await prisma.user.findMany();
    console.log('👥 Users in database:', users.length);
    
    // Check admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@cvera.com' }
    });
    console.log('🔑 Admin user exists:', !!admin);
    if (admin) {
      console.log('   - Admin name:', admin.name);
      console.log('   - Admin role:', admin.role);
    }
    
    // Check templates
    const templates = await prisma.template.findMany();
    console.log('📄 Templates in database:', templates.length);
    
    // Check API keys
    const apiKeys = await prisma.apiKey.findMany();
    console.log('🔐 API keys in database:', apiKeys.length);
    
    // Check subscriptions
    const subscriptions = await prisma.subscription.findMany();
    console.log('💳 Subscriptions in database:', subscriptions.length);
    
    // Check CVs
    const cvs = await prisma.cv.findMany();
    console.log('📋 CVs in database:', cvs.length);
    
    console.log('✅ Database check completed successfully!');
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
