const { PrismaClient } = require('@prisma/client');

async function checkLinkedInImportSystem() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 LinkedIn Import Sistemini Yoxlayırıq...');
        console.log('='.repeat(50));
        
        // 1. API Key-ləri yoxla
        console.log('\n1️⃣ API Key-lər:');
        const apiKeys = await prisma.apiKey.findMany({
            where: { service: 'linkedin' },
            orderBy: { priority: 'asc' }
        });
        
        console.log(`📊 Ümumi LinkedIn API key sayı: ${apiKeys.length}`);
        
        if (apiKeys.length === 0) {
            console.log('❌ Heç bir LinkedIn API key tapılmadı!');
            console.log('💡 API key əlavə etmək lazımdır.');
            return;
        }
        
        apiKeys.forEach((key, index) => {
            console.log(`\n   ${index + 1}. ${key.name}`);
            console.log(`      🔐 Key: ${key.key.substring(0, 20)}...`);
            console.log(`      🏢 Host: ${key.host || 'N/A'}`);
            console.log(`      ✅ Aktiv: ${key.active ? 'Bəli' : 'Xeyr'}`);
            console.log(`      📈 İstifadə: ${key.usageCount} dəfə`);
            console.log(`      📅 Son istifadə: ${key.lastUsed || 'Heç vaxt'}`);
        });
        
        // 2. İşləyən API key-i test et
        console.log('\n2️⃣ API Key Testi:');
        const activeKey = apiKeys.find(k => k.active);
        
        if (!activeKey) {
            console.log('❌ Aktiv API key tapılmadı!');
            return;
        }
        
        console.log(`🧪 Test edilən key: ${activeKey.name}`);
        
        const fetch = (await import('node-fetch')).default;
        
        // Test the working endpoint we know
        const testUrl = 'https://fresh-linkedin-profile-data.p.rapidapi.com/google-profiles';
        const testProfile = 'https://www.linkedin.com/in/elonmusk/';
        
        console.log(`🔗 Test URL: ${testUrl}`);
        console.log(`👤 Test profili: ${testProfile}`);
        
        try {
            const response = await fetch(testUrl, {
                method: 'POST',
                headers: {
                    'X-RapidAPI-Key': activeKey.key,
                    'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: testProfile })
            });
            
            console.log(`📡 Response Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API key işləyir!');
                console.log(`📄 Sample data: ${JSON.stringify(data).substring(0, 200)}...`);
            } else {
                const errorText = await response.text();
                console.log('❌ API key işləmir:', errorText.substring(0, 200));
            }
            
        } catch (error) {
            console.log('❌ API test xətası:', error.message);
        }
        
        // 3. LinkedIn Import API test et
        console.log('\n3️⃣ LinkedIn Import API Testi:');
        
        try {
            const importResponse = await fetch('http://localhost:3000/api/import/linkedin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    linkedinUrl: 'https://www.linkedin.com/in/elonmusk/'
                })
            });
            
            console.log(`📡 Import API Status: ${importResponse.status}`);
            
            const importResult = await importResponse.json();
            
            if (importResponse.ok && importResult.success) {
                console.log('✅ LinkedIn Import API işləyir!');
                console.log(`📊 İmport edilən məlumatlar:`);
                console.log(`   👤 Ad: ${importResult.data?.personalInfo?.name || 'N/A'}`);
                console.log(`   💼 Başlıq: ${importResult.data?.personalInfo?.headline || 'N/A'}`);
                console.log(`   📈 İş təcrübəsi: ${importResult.data?.experience?.length || 0} ədəd`);
                console.log(`   🎓 Təhsil: ${importResult.data?.education?.length || 0} ədəd`);
            } else {
                console.log('❌ LinkedIn Import API xətası:', importResult.error);
            }
            
        } catch (error) {
            console.log('❌ Import API test xətası:', error.message);
        }
        
        console.log('\n🏁 Test tamamlandı!');
        
    } catch (error) {
        console.error('💥 System test xətası:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLinkedInImportSystem();
