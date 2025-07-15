const { PrismaClient } = require('@prisma/client');

async function checkTemplates() {
  const prisma = new PrismaClient();
  
  try {
    const templates = await prisma.template.findMany();
    console.log('Mövcud templates:');
    console.log('=================');
    
    if (templates.length === 0) {
      console.log('Heç bir template yoxdur!');
    } else {
      templates.forEach((template, index) => {
        console.log(`${index + 1}. ID: ${template.id}`);
        console.log(`   Name: ${template.name}`);
        console.log(`   Tier: ${template.tier}`);
        console.log(`   Preview: ${template.previewUrl}`);
        console.log('---');
      });
    }
    
    console.log(`\nCəmi: ${templates.length} template`);
    
  } catch (error) {
    console.error('Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
