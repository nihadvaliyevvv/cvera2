const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('📋 Database-də olan template adları:');
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.tier})`);
    });
    
    console.log('\n🎨 Template dizayn təyinləri:');
    console.log('- Classic* -> Mavi rəngli, sadə dizayn');
    console.log('- Modern* -> Bənövşəyi gradyent, müasir dizayn');
    console.log('- Professional* -> Boz rəngli, peşəkar dizayn');
    console.log('- Digər -> Yaşıl rəngli, yaradıcı dizayn');
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
