const axios = require('axios');

const api_key = '6882894b855f5678d36484c8';
const url = 'https://api.scrapingdog.com/linkedin';

const params = {
  api_key: api_key,
  type: 'profile',
  linkId: 'musayevcreate',
  premium: 'false',
};

console.log('🔍 ScrapingDog API-dən bütün məlumatları yoxlayırıq...');

axios
  .get(url, { params: params })
  .then(function (response) {
    if (response.status === 200) {
      const data = response.data;

      // Array formatında gələrsə ilk elementi götürürük
      let profileData = data;
      if (Array.isArray(data) && data.length > 0) {
        profileData = data[0];
      }

      console.log('✅ ScrapingDog API cavabı alındı');
      console.log('📊 Available fields:', Object.keys(profileData));

      // Hər bölmə üçün ayrıca analiz
      console.log('\n👤 ŞƏXSI MƏLUMATLAR:');
      console.log('Full Name:', profileData.fullName || profileData.full_name || profileData.name);
      console.log('Headline:', profileData.headline);
      console.log('Location:', profileData.location);
      console.log('About/Summary:', profileData.about ? profileData.about.substring(0, 100) + '...' : 'N/A');
      console.log('Profile URL:', profileData.public_profile_url || profileData.public_identifier);

      console.log('\n💼 İŞ TƏCRÜBƏSI:');
      if (profileData.experience && Array.isArray(profileData.experience)) {
        console.log(`Təcrübə sayı: ${profileData.experience.length}`);
        profileData.experience.forEach((exp, index) => {
          console.log(`${index + 1}. ${exp.position || exp.title} @ ${exp.company_name || exp.company}`);
          console.log(`   Tarix: ${exp.starts_at || exp.start_date} - ${exp.ends_at || exp.end_date || 'Present'}`);
          console.log(`   Yer: ${exp.location || 'N/A'}`);
        });
      } else {
        console.log('❌ Təcrübə məlumatları tapılmadı');
      }

      console.log('\n🎓 TƏHSİL:');
      if (profileData.education && Array.isArray(profileData.education)) {
        console.log(`Təhsil sayı: ${profileData.education.length}`);
        profileData.education.forEach((edu, index) => {
          console.log(`${index + 1}. ${edu.college_degree || edu.degree} @ ${edu.college_name || edu.school}`);
          console.log(`   Sahə: ${edu.college_degree_field || edu.field}`);
          console.log(`   Müddət: ${edu.college_duration || edu.duration}`);
        });
      } else {
        console.log('❌ Təhsil məlumatları tapılmadı');
      }

      console.log('\n🌍 DİLLƏR:');
      if (profileData.languages && Array.isArray(profileData.languages)) {
        console.log(`Dil sayı: ${profileData.languages.length}`);
        profileData.languages.forEach((lang, index) => {
          console.log(`${index + 1}. ${typeof lang === 'string' ? lang : lang.name || lang.language}`);
        });
      } else {
        console.log('❌ Dil məlumatları tapılmadı');
      }

      console.log('\n🚀 LAYİHƏLƏR:');
      if (profileData.projects && Array.isArray(profileData.projects)) {
        console.log(`Layihə sayı: ${profileData.projects.length}`);
        profileData.projects.forEach((proj, index) => {
          console.log(`${index + 1}. ${proj.title || proj.name}`);
          console.log(`   Müddət: ${proj.duration || proj.date}`);
          console.log(`   Link: ${proj.link || proj.url || 'N/A'}`);
        });
      } else {
        console.log('❌ Layihə məlumatları tapılmadı');
      }

      console.log('\n🏆 SERTİFİKATLAR:');
      if (profileData.certification && Array.isArray(profileData.certification)) {
        console.log(`Sertifikat sayı: ${profileData.certification.length}`);
        profileData.certification.forEach((cert, index) => {
          console.log(`${index + 1}. ${cert.name || cert.title}`);
          console.log(`   Təşkilat: ${cert.authority || cert.organization}`);
          console.log(`   Tarix: ${cert.date || cert.issued_date}`);
        });
      } else {
        console.log('❌ Sertifikat məlumatları tapılmadı');
      }

      console.log('\n❤️ KÖNÜLLÜ TƏCRÜBƏ:');
      if (profileData.volunteering && Array.isArray(profileData.volunteering)) {
        console.log(`Könüllü təcrübə sayı: ${profileData.volunteering.length}`);
        profileData.volunteering.forEach((vol, index) => {
          console.log(`${index + 1}. ${vol.role || vol.title} @ ${vol.organization}`);
          console.log(`   Səbəb: ${vol.cause || vol.topic}`);
          console.log(`   Tarix: ${vol.start_date} - ${vol.end_date || 'Present'}`);
        });
      } else {
        console.log('❌ Könüllü təcrübə məlumatları tapılmadı');
      }

      console.log('\n🛠️ ƏLAVƏ MƏLUMATLAR:');
      console.log('Awards:', profileData.awards ? profileData.awards.length : 0);
      console.log('Publications:', profileData.publications ? profileData.publications.length : 0);
      console.log('Courses:', profileData.courses ? profileData.courses.length : 0);
      console.log('Skills:', profileData.skills ? profileData.skills.length : 0);

      // Full data structure log
      console.log('\n📝 FULL DATA STRUCTURE (preview):');
      console.log(JSON.stringify(profileData, null, 2).substring(0, 2000) + '...');

    } else {
      console.log('❌ Request failed with status code: ' + response.status);
    }
  })
  .catch(function (error) {
    console.error('❌ Error making the request: ' + error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  });
