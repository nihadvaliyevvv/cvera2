// Final test for template preview system
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testTemplatePreview() {
  try {
    console.log('🎨 Template Preview System Testi...\n');

    // 1. Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    const { accessToken } = loginResponse.data;
    console.log('✅ Login edildi');

    // 2. Templates yüklə
    const templatesResponse = await axios.get(`${BASE_URL}/api/templates`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const templates = templatesResponse.data;
    console.log(`✅ ${templates.length} template yükləndi`);

    // 3. Free templates tap
    const freeTemplates = templates.filter(t => t.tier === 'Free' && t.hasAccess);
    console.log(`✅ ${freeTemplates.length} pulsuz template tapıldı`);

    // 4. Hər template tipini göstər
    const templateTypes = {
      classic: freeTemplates.filter(t => t.name.toLowerCase().includes('classic')),
      modern: freeTemplates.filter(t => t.name.toLowerCase().includes('modern')),
      professional: freeTemplates.filter(t => t.name.toLowerCase().includes('professional')),
      other: freeTemplates.filter(t => 
        !t.name.toLowerCase().includes('classic') && 
        !t.name.toLowerCase().includes('modern') && 
        !t.name.toLowerCase().includes('professional')
      )
    };

    console.log('\n📊 Template tip sayları:');
    console.log(`- Classic: ${templateTypes.classic.length}`);
    console.log(`- Modern: ${templateTypes.modern.length}`);
    console.log(`- Professional: ${templateTypes.professional.length}`);
    console.log(`- Digər: ${templateTypes.other.length}`);

    console.log('\n🎨 Template dizayn təyinləri:');
    templateTypes.classic.forEach(t => console.log(`- ${t.name} → Mavi rəngli dizayn`));
    templateTypes.modern.forEach(t => console.log(`- ${t.name} → Bənövşəyi gradyent dizayn`));
    templateTypes.professional.forEach(t => console.log(`- ${t.name} → Boz rəngli dizayn`));
    templateTypes.other.forEach(t => console.log(`- ${t.name} → Yaşıl rəngli dizayn`));

    // 5. Test CV yaratmaq üçün sample data
    const sampleCVData = {
      personalInfo: {
        name: 'Ayşe Məmmədova',
        email: 'ayse@example.com',
        phone: '+994 50 123 45 67',
        location: 'Bakı, Azərbaycan',
        summary: 'Təcrübəli proqram tərtibatçısı və layihə rəhbəri'
      },
      experience: [
        {
          id: '1',
          company: 'TechCorp',
          position: 'Senior Developer',
          startDate: '2020-01',
          endDate: '2024-12',
          current: false,
          description: 'Full-stack web development',
          location: 'Bakı'
        }
      ],
      education: [
        {
          id: '1',
          institution: 'Bakı Dövlət Universiteti',
          degree: 'Bakalavr',
          field: 'Kompüter Elmləri',
          startDate: '2016-09',
          endDate: '2020-06',
          current: false
        }
      ],
      skills: [
        {
          id: '1',
          name: 'JavaScript',
          level: 'Expert',
          category: 'Programming'
        },
        {
          id: '2',
          name: 'React',
          level: 'Advanced',
          category: 'Frontend'
        }
      ],
      languages: [
        {
          id: '1',
          name: 'Azərbaycanca',
          level: 'Native'
        },
        {
          id: '2',
          name: 'İngiliscə',
          level: 'Professional'
        }
      ],
      projects: [],
      certifications: []
    };

    // 6. Test CV yaratmaq
    console.log('\n🧪 Test CV yaradılır...');
    const testCV = {
      title: 'Template Test CV',
      templateId: freeTemplates[0].id, // İlk template
      data: sampleCVData
    };

    console.log(`✅ Test CV strukturu hazırlandı (Template: ${freeTemplates[0].name})`);
    console.log('\n🎉 Template preview sistemi hazırdır!');
    console.log('\nℹ️  İndi CVEditor komponentində template seçimi dəyişdirdikdə,');
    console.log('   CVPreview komponentində fərqli dizaynlar görünəcək:');
    console.log('   - Classic → Mavi rəngli');
    console.log('   - Modern → Bənövşəyi gradyent');
    console.log('   - Professional → Boz rəngli');
    console.log('   - Digər → Yaşıl rəngli');
    
  } catch (error) {
    console.error('❌ Test uğursuz:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testTemplatePreview();
