const fetch = require('node-fetch');

async function testFullLinkedInFlow() {
    console.log('🚀 FULL LINKEDIN IMPORT VƏ CV YARATMA TEST');
    console.log('='.repeat(60));
    
    const testProfile = 'https://www.linkedin.com/in/elonmusk/';
    
    try {
        // 1. LinkedIn Import Test
        console.log('\n1️⃣ LinkedIn Import Test:');
        console.log(`🔗 Test profili: ${testProfile}`);
        
        const importResponse = await fetch('http://localhost:3000/api/import/linkedin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                linkedinUrl: testProfile
            })
        });
        
        console.log(`📡 Import Status: ${importResponse.status}`);
        
        const importData = await importResponse.json();
        
        if (importResponse.ok && importData.success) {
            console.log('✅ LinkedIn Import UĞURLU!');
            console.log(`📊 Import edilən məlumatlar:`);
            console.log(`   👤 Ad: ${importData.data?.personalInfo?.name || 'N/A'}`);
            console.log(`   💼 Başlıq: ${importData.data?.personalInfo?.headline || 'N/A'}`);
            console.log(`   📍 Yer: ${importData.data?.personalInfo?.location || 'N/A'}`);
            console.log(`   📧 Email: ${importData.data?.personalInfo?.email || 'N/A'}`);
            console.log(`   📱 Telefon: ${importData.data?.personalInfo?.phone || 'N/A'}`);
            console.log(`   🔗 LinkedIn: ${importData.data?.personalInfo?.linkedin || 'N/A'}`);
            console.log(`   📝 Xülasə: ${importData.data?.personalInfo?.summary ? 'Var' : 'Yoxdur'}`);
            console.log(`   📈 İş təcrübəsi: ${importData.data?.experience?.length || 0} ədəd`);
            console.log(`   🎓 Təhsil: ${importData.data?.education?.length || 0} ədəd`);
            console.log(`   🛠️ Bacarıqlar: ${importData.data?.skills?.length || 0} ədəd`);
            console.log(`   🌍 Dillər: ${importData.data?.languages?.length || 0} ədəd`);
            console.log(`   🏆 Sertifikatlar: ${importData.data?.certifications?.length || 0} ədəd`);
            
            // Check if we got meaningful data
            const hasRealData = (
                importData.data?.personalInfo?.name && 
                importData.data?.personalInfo?.name !== 'Demo User' &&
                !importData.data?.personalInfo?.name.includes('Sample')
            );
            
            if (hasRealData) {
                console.log('🎉 REAL MƏLUMATLAR ALINDI - MOCK DATA YOXDUR!');
            } else {
                console.log('⚠️  Mock data alınmış ola bilər, real data yoxdur');
            }
            
            // 2. CV Yaratma Test (simulation)
            console.log('\n2️⃣ CV Yaratma Test:');
            
            // Simulate CV creation with LinkedIn data
            const cvData = {
                personalInfo: importData.data.personalInfo,
                experience: importData.data.experience || [],
                education: importData.data.education || [],
                skills: importData.data.skills || [],
                languages: importData.data.languages || [],
                certifications: importData.data.certifications || []
            };
            
            console.log('📋 CV Data Strukturu:');
            console.log(`   ✅ Personal Info: ${Object.keys(cvData.personalInfo).length} field`);
            console.log(`   ✅ Experience: ${cvData.experience.length} item`);
            console.log(`   ✅ Education: ${cvData.education.length} item`);
            console.log(`   ✅ Skills: ${cvData.skills.length} item`);
            console.log(`   ✅ Languages: ${cvData.languages.length} item`);
            console.log(`   ✅ Certifications: ${cvData.certifications.length} item`);
            
            // Check data quality
            console.log('\n3️⃣ Data Keyfiyyət Yoxlaması:');
            
            // Personal Info validation
            const personalInfoScore = [
                cvData.personalInfo.name ? 1 : 0,
                cvData.personalInfo.headline ? 1 : 0,
                cvData.personalInfo.summary ? 1 : 0,
                cvData.personalInfo.linkedin ? 1 : 0
            ].reduce((a, b) => a + b, 0);
            
            console.log(`📊 Personal Info tamamlıq: ${personalInfoScore}/4`);
            
            // Experience validation
            const experienceScore = cvData.experience.filter(exp => 
                exp.company && exp.position
            ).length;
            
            console.log(`📊 İş təcrübəsi keyfiyyəti: ${experienceScore}/${cvData.experience.length}`);
            
            // Education validation
            const educationScore = cvData.education.filter(edu => 
                edu.institution && edu.degree
            ).length;
            
            console.log(`📊 Təhsil keyfiyyəti: ${educationScore}/${cvData.education.length}`);
            
            // Overall score
            const totalScore = personalInfoScore + 
                (experienceScore > 0 ? 2 : 0) + 
                (educationScore > 0 ? 1 : 0) + 
                (cvData.skills.length > 0 ? 1 : 0);
            
            console.log(`\n🏆 Ümumi Keyfiyyət Balı: ${totalScore}/8`);
            
            if (totalScore >= 6) {
                console.log('🎉 ÇOX YAXŞI - LinkedIn import mükəmməl işləyir!');
            } else if (totalScore >= 4) {
                console.log('✅ YAXŞI - LinkedIn import əsasən işləyir');
            } else {
                console.log('⚠️  ZƏİF - LinkedIn import problem yaşayır');
            }
            
        } else {
            console.log('❌ LinkedIn Import UĞURSUZ:');
            console.log(`   Error: ${importData.error}`);
            console.log(`   Meta: ${JSON.stringify(importData.meta)}`);
        }
        
    } catch (error) {
        console.error('💥 Test xətası:', error.message);
    }
    
    console.log('\n🏁 TEST TAMAMLANDI');
    console.log('='.repeat(60));
}

// Test-i çalış
testFullLinkedInFlow();
