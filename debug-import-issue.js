const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugImportIssue() {
  console.log('🔍 LinkedIn Import Problem Debug\n');

  try {
    // 1. Check if API keys exist in database
    console.log('📊 Database-də API key-ləri yoxlayırıq...');
    const allApiKeys = await prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        service: true,
        active: true,
        priority: true,
        host: true,
        usageCount: true,
        lastUsed: true,
        lastResult: true
      }
    });

    console.log(`✅ Ümumi API key sayı: ${allApiKeys.length}`);
    
    if (allApiKeys.length === 0) {
      console.log('❌ Database-də heç bir API key tapılmadı!');
      return;
    }

    // Show all keys
    console.log('\n📋 Bütün API Key-lər:');
    allApiKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   Service: ${key.service}`);
      console.log(`   Active: ${key.active}`);
      console.log(`   Priority: ${key.priority}`);
      console.log(`   Host: ${key.host || 'DEFAULT'}`);
      console.log(`   Usage: ${key.usageCount}`);
      console.log(`   Last Result: ${key.lastResult || 'Heç vaxt'}`);
      console.log('');
    });

    // 2. Check LinkedIn specific keys
    const linkedinKeys = await prisma.apiKey.findMany({
      where: {
        service: 'linkedin',
        active: true
      }
    });

    console.log(`🔗 LinkedIn servis üçün aktiv key-lər: ${linkedinKeys.length}`);

    if (linkedinKeys.length === 0) {
      console.log('❌ LinkedIn servis üçün aktiv API key tapılmadı!');
      console.log('💡 Həll: Admin panelində LinkedIn API key-i əlavə edin və aktiv edin.');
      return;
    }

    // 3. Test the LinkedIn import API directly
    console.log('\n🌐 LinkedIn import API test edilir...');
    const testUrl = 'https://linkedin.com/in/test-profile';
    
    try {
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
      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('✅ API cavabı alındı');
        console.log(`👤 Profil: ${data.personalInfo?.name || 'Ad yoxdur'}`);
      } else {
        console.log(`❌ API xətası:`);
        console.log(responseText);
        
        // Try to parse as JSON for better error display
        try {
          const errorData = JSON.parse(responseText);
          console.log(`🚨 Error Details: ${errorData.error}`);
        } catch (e) {
          console.log(`🚨 Raw Error: ${responseText}`);
        }
      }
    } catch (fetchError) {
      console.log(`💥 Fetch xətası: ${fetchError.message}`);
      console.log('💡 Server işləyir? npm run dev command işlədildi?');
    }

    // 4. Check specific function behavior
    console.log('\n🔧 getActiveApiKeys funksiyası test edilir...');
    
    // Simulate the function call from LinkedIn import
    const activeKeys = await prisma.apiKey.findMany({
      where: {
        active: true,
        service: 'linkedin'
      },
      orderBy: [
        { priority: 'asc' },
        { usageCount: 'asc' },
        { lastUsed: 'asc' }
      ],
      select: {
        id: true,
        key: true,
        name: true,
        priority: true,
        host: true
      }
    });

    console.log(`🎯 getActiveApiKeys nəticəsi: ${activeKeys.length} key`);
    
    if (activeKeys.length > 0) {
      console.log('📝 İlk key məlumatları:');
      const firstKey = activeKeys[0];
      console.log(`   Name: ${firstKey.name}`);
      console.log(`   Host: ${firstKey.host || 'DEFAULT (environment variable istifadə ediləcək)'}`);
      console.log(`   Priority: ${firstKey.priority}`);
      console.log(`   Key Preview: ${firstKey.key.substring(0, 10)}...`);
    }

    // 5. Check environment variables
    console.log('\n🌍 Environment variable-ları yoxlayırıq...');
    console.log(`RAPIDAPI_HOST: ${process.env.RAPIDAPI_HOST || 'YOX'}`);
    console.log(`RAPIDAPI_KEY: ${process.env.RAPIDAPI_KEY ? 'VAR' : 'YOX'}`);
    console.log(`FEATURE_LINKEDIN_IMPORT: ${process.env.FEATURE_LINKEDIN_IMPORT}`);

  } catch (error) {
    console.error('💥 Debug xətası:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugImportIssue();
