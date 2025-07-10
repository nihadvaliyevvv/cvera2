const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProfessionalTemplate() {
  try {
    console.log('🎨 Creating Professional Resume Template...');
    
    const template = await prisma.template.create({
      data: {
        name: 'Professional Resume',
        tier: 'Medium',
        previewUrl: '/templates/professional-resume-preview.jpg',
        description: 'Modern, clean resume design with sidebar layout and professional typography. Perfect for corporate professionals.'
      }
    });
    
    console.log('✅ Template created successfully:');
    console.log(`   - ID: ${template.id}`);
    console.log(`   - Name: ${template.name}`);
    console.log(`   - Tier: ${template.tier}`);
    console.log(`   - Preview URL: ${template.previewUrl}`);
    console.log(`   - Description: ${template.description}`);
    
  } catch (error) {
    console.error('❌ Error creating template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProfessionalTemplate();
