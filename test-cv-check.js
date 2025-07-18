const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCVs() {
  try {
    console.log('🔍 CV-ləri yoxlayır...');
    
    // First check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection uğurlu');
    
    const cvs = await prisma.cV.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        createdAt: true,
        cv_data: true
      },
      take: 10
    });
    
    console.log(`📋 Mövcud CV-lər: ${cvs.length} ədəd`);
    
    cvs.forEach((cv, index) => {
      console.log(`${index + 1}. ID: ${cv.id}, User: ${cv.userId}, Title: ${cv.title || 'Başlıqsız'}`);
      console.log(`   Created: ${cv.createdAt}`);
      console.log(`   Has Data: ${cv.cv_data ? 'Bəli' : 'Xeyr'}`);
      console.log('---');
    });
    
    if (cvs.length > 0) {
      console.log(`\n🎯 Test üçün CV ID-si: ${cvs[0].id}`);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCVs();
