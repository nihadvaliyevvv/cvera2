const { PrismaClient } = require('@prisma/client');

async function addWorkingLinkedInAPI() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔧 İşləyən LinkedIn API key əlavə edilir...');
        
        // Delete existing LinkedIn keys
        await prisma.apiKey.deleteMany({
            where: { service: 'linkedin' }
        });
        console.log('🗑️ Köhnə LinkedIn API key-lər silindi');
        
        // Add working LinkedIn API key
        const newKey = await prisma.apiKey.create({
            data: {
                id: 'linkedin-working-' + Date.now(),
                name: 'Fresh LinkedIn Profile Data - Working',
                key: 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4', // Working key you provided
                service: 'linkedin',
                host: 'fresh-linkedin-profile-data.p.rapidapi.com',
                active: true,
                priority: 1,
                usageCount: 0,
                lastUsed: null,
                lastResult: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        
        console.log('✅ Yeni LinkedIn API key əlavə edildi:');
        console.log(`   ID: ${newKey.id}`);
        console.log(`   Name: ${newKey.name}`);
        console.log(`   Host: ${newKey.host}`);
        console.log(`   Key: ${newKey.key.substring(0, 20)}...`);
        console.log(`   Active: ${newKey.active}`);
        console.log(`   Priority: ${newKey.priority}`);
        
        // Test the API key immediately
        console.log('\n🧪 API key test edilir...');
        
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch('https://fresh-linkedin-profile-data.p.rapidapi.com/google-profiles', {
            method: 'POST',
            headers: {
                'X-RapidAPI-Key': newKey.key,
                'X-RapidAPI-Host': 'fresh-linkedin-profile-data.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: 'https://www.linkedin.com/in/elonmusk/'
            })
        });
        
        console.log(`📡 API Test Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('🎉 API KEY İŞLƏYİR!');
            console.log(`📄 Sample response: ${JSON.stringify(data).substring(0, 300)}...`);
            
            // Update success statistics
            await prisma.apiKey.update({
                where: { id: newKey.id },
                data: {
                    usageCount: 1,
                    lastUsed: new Date(),
                    lastResult: 'success - working perfectly'
                }
            });
            
        } else {
            const errorText = await response.text();
            console.log('❌ API Test uğursuz:', errorText.substring(0, 200));
        }
        
    } catch (error) {
        console.error('💥 Xəta:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addWorkingLinkedInAPI();
