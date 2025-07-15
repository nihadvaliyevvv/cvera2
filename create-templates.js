const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTemplates() {
  try {
    // Clear existing templates
    await prisma.template.deleteMany();
    
    // Create Basic template (saxlanılan)
    const basicTemplate = await prisma.template.create({
      data: {
        name: 'Basic',
        tier: 'Free',
        previewUrl: '/templates/basic-preview.jpg',
        description: 'Simple and clean design for professional use'
      }
    });
    
    // Create Bold template (Resumonk-dan kopyalanan)
    const boldTemplate = await prisma.template.create({
      data: {
        name: 'Bold',
        tier: 'Free',
        previewUrl: '/templates/bold-preview.jpg',
        description: 'Bold and modern design inspired by Resumonk'
      }
    });
    
    console.log('✅ Templates successfully created:');
    console.log('- Basic Template:', basicTemplate.id);
    console.log('- Bold Template:', boldTemplate.id);
    
  } catch (error) {
    console.error('❌ Error creating templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();
