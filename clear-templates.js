const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllTemplates() {
  try {
    console.log('🗑️  Clearing all templates from database...');
    
    const deleteResult = await prisma.template.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} templates`);
    
    // Verify deletion
    const remainingTemplates = await prisma.template.findMany();
    console.log(`📊 Remaining templates: ${remainingTemplates.length}`);
    
    if (remainingTemplates.length === 0) {
      console.log('🎉 All templates successfully cleared!');
    } else {
      console.log('⚠️  Some templates may still exist');
    }
    
  } catch (error) {
    console.error('❌ Error clearing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllTemplates();
