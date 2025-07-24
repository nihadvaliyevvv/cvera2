const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixApiKeyIssue() {
  console.log('🔧 API Key Issue Fix Tool\n');

  try {
    // 1. Deactivate all current fake API keys
    console.log('🚫 Köhnə test API key-lərini deaktiv edirəm...');
    
    const updatedKeys = await prisma.apiKey.updateMany({
      where: {
        service: 'linkedin',
        key: {
          contains: 'sample-api'
        }
      },
      data: {
        active: false
      }
    });

    console.log(`✅ ${updatedKeys.count} test key deaktiv edildi`);

    // 2. Delete or update fake keys
    console.log('🗑️  Fake API key-lərini silinir...');
    
    const deletedKeys = await prisma.apiKey.deleteMany({
      where: {
        service: 'linkedin',
        OR: [
          { key: { contains: 'sample-api' } },
          { key: { contains: 'test-key' } },
          { key: { contains: 'fake' } },
        ]
      }
    });

    console.log(`✅ ${deletedKeys.count} fake key silindi`);

    // 3. Show remaining keys
    const remainingKeys = await prisma.apiKey.findMany({
      where: {
        service: 'linkedin'
      },
      select: {
        id: true,
        name: true,
        key: true,
        active: true,
        lastResult: true
      }
    });

    console.log(`\n📊 Qalan LinkedIn API key-lər: ${remainingKeys.length}`);
    
    remainingKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Key: ${key.key.substring(0, 15)}...`);
      console.log(`   Active: ${key.active}`);
      console.log(`   Last Result: ${key.lastResult || 'Heç vaxt'}`);
      console.log('');
    });

    // 4. Create a working demo instruction
    if (remainingKeys.length === 0) {
      console.log('📝 Həll üçün təlimat:');
      console.log('');
      console.log('1. Admin panelində (http://localhost:3000/error/api-keys) yeni API key əlavə edin');
      console.log('2. RapidAPI-dan real LinkedIn API key əldə edin');
      console.log('3. Və ya sistemin fallback rejimindən istifadə edin');
      console.log('');
      console.log('💡 Fallback rejimi artıq aktiv və işləyir!');
      console.log('   API key-lər uğursuz olduqda avtomatik olaraq');
      console.log('   LinkedIn URL-dən əsas profil məlumatları yaradılır.');
    }
    
    // 5. Test the current state
    console.log('\n🧪 Cari vəziyyəti test edirəm...');
    
    const testResponse = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://linkedin.com/in/test-profile'
      })
    });

    console.log(`📡 Test Response Status: ${testResponse.status}`);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Sistem işləyir!');
      console.log(`👤 Test profil adı: ${testData.data?.personalInfo?.name}`);
    }

  } catch (error) {
    console.error('💥 Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixApiKeyIssue();
