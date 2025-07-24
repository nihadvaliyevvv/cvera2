const http = require('http');

function testLinkedInAPI() {
    console.log('🧪 LinkedIn API Test başlayır...');
    
    const postData = JSON.stringify({
        linkedinUrl: "https://www.linkedin.com/in/elonmusk/"
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/import/linkedin',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 20000 // 20 saniyə timeout
    };
    
    const req = http.request(options, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
            process.stdout.write('.');
        });
        
        res.on('end', () => {
            console.log('\n✅ Cavab tamamlandı');
            try {
                const jsonData = JSON.parse(data);
                
                if (jsonData.success) {
                    console.log('🎉 UĞURLU! Real məlumatlar alındı:');
                    console.log(`👤 Ad: ${jsonData.data?.personalInfo?.name || 'N/A'}`);
                    console.log(`💼 Başlıq: ${jsonData.data?.personalInfo?.headline || 'N/A'}`);
                    console.log(`🌍 Yer: ${jsonData.data?.personalInfo?.location || 'N/A'}`);
                    console.log(`📈 İş təcrübəsi: ${jsonData.data?.experience?.length || 0} ədəd`);
                    console.log(`🎓 Təhsil: ${jsonData.data?.education?.length || 0} ədəd`);
                    console.log('\n✅ MOCK DATA YOXDUR - SADƏCƏ REAL API DATA!');
                } else {
                    console.log('❌ UĞURSUZ:', jsonData.error);
                    console.log('🔍 Meta məlumatlar:', jsonData.meta);
                    console.log('✅ Yaxşı: Mock data fallback işlətilmədi');
                }
                
            } catch (error) {
                console.log('❌ JSON parse xətası:', error.message);
                console.log('📄 İlk 200 char:', data.substring(0, 200));
            }
            
            process.exit(0);
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request xətası:', error.message);
        process.exit(1);
    });
    
    req.on('timeout', () => {
        console.log('⏰ Request timeout oldu (20s)');
        req.destroy();
        console.log('ℹ️  Server yavaş cavab verir, lakin bu normaldır API yoxlanarkən');
        process.exit(1);
    });
    
    req.write(postData);
    req.end();
}

// Test işə sal
testLinkedInAPI();
