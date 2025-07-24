const { PrismaClient } = require('@prisma/client');

async function addCorrectAPI() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔧 Düzgün API key və endpoint əlavə edilir...');
        
        // Delete old keys first
        await prisma.apiKey.deleteMany({
            where: { service: 'linkedin' }
        });
        console.log('🗑️ Köhnə API key-lər silindi');
        
        // Add correct API key with proper endpoint
        const newKey = await prisma.apiKey.create({
            data: {
                id: 'correct-linkedin-api-' + Date.now(),
                name: 'Fresh LinkedIn - Google Profiles Endpoint',
                service: 'linkedin',
                key: 'e69773e8c2msh50ce2f81e481a35p1888abjsn83f1b967cbe4',
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
        
        console.log('✅ Düzgün API key əlavə edildi:');
        console.log(`   ID: ${newKey.id}`);
        console.log(`   Host: ${newKey.host}`);
        console.log(`   Key: ${newKey.key.substring(0, 20)}...`);
        console.log(`   Endpoint: /google-profiles`);
        console.log(`   Method: POST`);
        
        // Test the API key directly with POST request
        console.log('\n🧪 API key test edilir...');
        
        const https = require('https');
        
        const testData = JSON.stringify({
            url: "https://www.linkedin.com/in/elonmusk/"
        });
        
        const options = {
            method: 'POST',
            hostname: 'fresh-linkedin-profile-data.p.rapidapi.com',
            port: null,
            path: '/google-profiles',
            headers: {
                'x-rapidapi-key': newKey.key,
                'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            }
        };
        
        const req = https.request(options, function (res) {
            console.log(`📊 API Response Status: ${res.statusCode}`);
            
            const chunks = [];
            
            res.on('data', function (chunk) {
                chunks.push(chunk);
            });
            
            res.on('end', async function () {
                const body = Buffer.concat(chunks);
                const responseText = body.toString();
                
                try {
                    const data = JSON.parse(responseText);
                    console.log('🎉 API KEY İŞLƏYİR! Sample data:');
                    console.log(`   Data structure:`, Object.keys(data));
                    
                    if (data.name || data.full_name) {
                        console.log(`   Name: ${data.name || data.full_name}`);
                    }
                    if (data.headline || data.title) {
                        console.log(`   Headline: ${data.headline || data.title}`);
                    }
                    
                    // Update success count
                    await prisma.apiKey.update({
                        where: { id: newKey.id },
                        data: {
                            usageCount: 1,
                            lastUsed: new Date(),
                            lastResult: 'success - POST test passed'
                        }
                    });
                    
                } catch (error) {
                    console.log('📄 Raw response:', responseText.substring(0, 500));
                    if (responseText.length > 500) {
                        console.log('   ... (truncated)');
                    }
                }
                
                await prisma.$disconnect();
            });
        });
        
        req.on('error', function (error) {
            console.log('❌ API Error:', error.message);
        });
        
        req.write(testData);
        req.end();
        
    } catch (error) {
        console.error('❌ Database xətası:', error);
        await prisma.$disconnect();
    }
}

addCorrectAPI();
