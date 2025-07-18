const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBasicTemplates() {
  try {
    console.log('🔄 Creating basic templates...');
    
    // Clear existing templates first
    await prisma.template.deleteMany();
    console.log('✅ Cleared existing templates');
    
    // Create Basic template
    const basicTemplate = await prisma.template.create({
      data: {
        id: 'basic',
        name: 'Basic',
        tier: 'Free',
        previewUrl: '/templates/basic-preview.jpg',
        description: 'Simple and clean design for professional use'
      }
    });
    
    // Create Resumonk Bold template
    const boldTemplate = await prisma.template.create({
      data: {
        id: 'resumonk-bold',
        name: 'Resumonk Bold', 
        tier: 'Free',
        previewUrl: '/templates/resumonk-bold-preview.jpg',
        description: 'Bold and modern design inspired by Resumonk'
      }
    });
    
    console.log('✅ Templates successfully created:');
    console.log(`  - Basic Template: ${basicTemplate.id}`);
    console.log(`  - Resumonk Bold Template: ${boldTemplate.id}`);
    
    // Verify templates were created
    const allTemplates = await prisma.template.findMany();
    console.log(`\n📊 Total templates in database: ${allTemplates.length}`);
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBasicTemplates();
