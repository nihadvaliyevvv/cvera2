const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createWorkingTemplates() {
  try {
    console.log('🔧 2 free + 2 paid template yaradılır...');

    const templates = [
      {
        name: 'Basic Template',
        tier: 'Free',
        previewUrl: '/templates/classic-professional.png',
        description: 'Sadə və klassik dizayn. Bütün sahələr üçün uyğun.',
      },
      {
        name: 'Resumonk Bold',
        tier: 'Free',
        previewUrl: '/templates/modern-creative.png',
        description: 'Qalın başlıqlar və müasir dizayn. Diqqət çəkən format.',
      },
      {
        name: 'Modern Creative',
        tier: 'Free',
        previewUrl: '/templates/tech-professional.png',
        description: 'Müasir dizayn və yaradıcı elementlər. Kreativ sahələr üçün ideal.',
      },
      {
        name: 'Executive Premium',
        tier: 'Free',
        previewUrl: '/templates/executive-premium.png',
        description: 'Yüksək səviyyəli rəhbər vəzifələr üçün premium template.',
      }
    ];

    // Delete existing templates to avoid duplicates
    await prisma.template.deleteMany({});
    console.log('🗑️ Köhnə templatelar silindi');

    // Create new templates
    for (const templateData of templates) {
      const template = await prisma.template.create({
        data: templateData
      });
      console.log(`✅ Template yaradıldı: ${template.name} (${template.tier})`);
    }

    console.log('\n📋 Yaradılan templatelar:');
    const allTemplates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });

    allTemplates.forEach(template => {
      console.log(`- ${template.name}: ${template.tier} tier`);
      console.log(`  Preview: ${template.previewUrl}`);
      console.log(`  Təsvir: ${template.description}`);
      console.log('');
    });

    console.log('🎉 2 free + 2 paid template uğurla yaradıldı!');

  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWorkingTemplates();
