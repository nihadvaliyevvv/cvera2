const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    console.log('🔍 Checking templates in database...');
    
    const templates = await prisma.template.findMany();
    
    console.log(`📊 Found ${templates.length} templates in database:`);
    
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.tier}) - ID: ${template.id}`);
    });
    
    if (templates.length === 0) {
      console.log('❌ No templates found! Need to seed templates.');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
