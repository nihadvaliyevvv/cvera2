const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLinkedInHostDynamic() {
  console.log('🚀 LinkedIn Host Dynamic Test - Başlayır...\n');

  try {
    // 1. Database-də API key-ləri yoxla
    console.log('📊 Database-də API key-ləri yoxlayırıq...');
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        service: 'linkedin'
      },
      select: {
        id: true,
        name: true,
        key: true,
        host: true,
        priority: true,
        usageCount: true
      }
    });

    console.log(`✅ Tapılan API key sayı: ${apiKeys.length}\n`);

    if (apiKeys.length === 0) {
      // Test üçün API key yaradaq
      console.log('🔑 Test API key yaradılır...');
      const testKey = await prisma.apiKey.create({
        data: {
          name: 'Test RapidAPI Key',
          key: 'test-key-123',
          service: 'linkedin',
          host: 'fresh-linkedin-profile-data.p.rapidapi.com',
          priority: 1,
          active: true
        }
      });
      console.log(`✅ Test API key yaradıldı: ${testKey.name}`);
      apiKeys.push(testKey);
    }

    // 2. Hər API key üçün host məlumatını göstər
    console.log('\n📋 API Key-lər və Host məlumatları:');
    apiKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Host: ${key.host || 'DEFAULT ISTIFADƏ EDILƏCƏK'}`);
      console.log(`   Priority: ${key.priority}`);
      console.log(`   Usage Count: ${key.usageCount}`);
      console.log('');
    });

    // 3. API route test et
    console.log('🌐 LinkedIn import API test edilir...');
    const testUrl = 'https://linkedin.com/in/test-user';
    
    const response = await fetch('http://localhost:3000/api/import/linkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testUrl
      })
    });

    console.log(`📡 API Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API cavabı alındı');
      console.log(`👤 Profil: ${data.personalInfo?.name || 'Ad tapılmadı'}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ API xətası: ${errorText}`);
    }

    // 4. API key-lərin usage statistikasını yoxla
    console.log('\n📈 API Key-lərin yenilənmiş statistikaları:');
    const updatedKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        service: 'linkedin'
      },
      select: {
        name: true,
        host: true,
        usageCount: true,
        lastUsed: true,
        lastResult: true
      }
    });

    updatedKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Host: ${key.host || 'DEFAULT'}`);
      console.log(`   Usage Count: ${key.usageCount}`);
      console.log(`   Last Used: ${key.lastUsed || 'Heç vaxt'}`);
      console.log(`   Last Result: ${key.lastResult || 'Məlumat yoxdur'}`);
      console.log('');
    });

    console.log('🎉 Test tamamlandı!');

  } catch (error) {
    console.error('💥 Test xətası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test işlət
testLinkedInHostDynamic();
