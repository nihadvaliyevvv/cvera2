const { PrismaClient } = require('@prisma/client');

async function resetTemplates() {
  const prisma = new PrismaClient();
  
  try {
    // Bütün template-ləri sil
    console.log('Bütün template-ləri silirəm...');
    await prisma.template.deleteMany();
    
    // Yalnız 2 template əlavə et
    console.log('Yeni template-lər əlavə edirəm...');
    
    const templates = await prisma.template.createMany({
      data: [
        {
          id: 'basic-template',
          name: 'Basic',
          tier: 'Free',
          previewUrl: '/templates/basic-preview.jpg'
        },
        {
          id: 'resumonk-bold',
          name: 'Resumonk Bold',
          tier: 'Medium',
          previewUrl: '/templates/resumonk-bold-preview.jpg'
        }
      ]
    });
    
    console.log('✅ Template-lər uğurla dəyişdirildi!');
    
    // Yoxla
    const finalTemplates = await prisma.template.findMany();
    console.log('\nYeni template-lər:');
    finalTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.tier}) - ID: ${template.id}`);
    });
    
  } catch (error) {
    console.error('Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetTemplates();
