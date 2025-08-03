// Test ScrapingDog API məlumatlarının CVEditor-də düzgün transform olunmasını
const scrapingDogData = [
  {
    "fullName": "Ilgar Musayev",
    "headline": "Co-Founder @ Veezet   Founder @ CVERA  SDET(Java) Mentor @ CAPS Academy",
    "location": "Azerbaijan",
    "about": "As a Mentor at CAPS Academy — the first SDET training institution in Azerbaijan — I support the development of future software professionals through practical guidance and a curriculum grounded in Java and software testing principles. The academy's hybrid learning model promotes flexibility and accessibility for learners from diverse backgrounds.As Co-Founder of Veezet, I specialize in building scalable and efficient back-end web solutions. I lead collaborative initiatives that prioritize clean architecture, performance, and user-centric design.As the Founder of CVERA, I focus on delivering dynamic and responsive web experiences using Next.js. My role has evolved from hands-on development to leading project management, where I've driven the growth of the platform through structured workflows, cross-functional coordination, and a strong emphasis on quality and innovation.",
    "experience": [
      {
        "position": "Founder",
        "company_name": "CVERA",
        "location": "Azerbaijan",
        "summary": "",
        "starts_at": "Jul 2025",
        "ends_at": "Present",
        "duration": "1 month"
      },
      {
        "position": "SDET & Java Mentor",
        "company_name": "CAPS Academy",
        "location": "Baku, Azerbaijan",
        "summary": "• Served as an SDET and Java Mentor at CAPS Academy, the first institution in Azerbaijan dedicated to SDET training.  • Developed comprehensive course materials and hands-on projects to enhance students' understanding of Java and software testing principles.  • Facilitated hybrid learning sessions, enabling flexible access to quality education for aspiring software developers.",
        "starts_at": "May 2025",
        "ends_at": "Present",
        "duration": "3 months"
      },
      {
        "position": "Co-Founder",
        "company_name": "Veezet",
        "location": "Baku, Contiguous Azerbaijan, Azerbaijan",
        "summary": "",
        "starts_at": "May 2023",
        "ends_at": "Present",
        "duration": "2 years 3 months"
      },
      {
        "position": "Java Programmer",
        "company_name": "Freelance",
        "location": "Azerbaijan",
        "summary": "",
        "starts_at": "Dec 2024",
        "ends_at": "Apr 2025",
        "duration": "5 months"
      }
    ],
    "education": [
      {
        "college_name": "Azerbaijan State University of Oil and Industry",
        "college_degree": "Bachelor's degree",
        "college_degree_field": "Electrical and Electronics Engineering",
        "college_duration": "2022 - 2026",
        "college_activity": ""
      }
    ],
    "projects": [
      {
        "title": "CVera",
        "duration": "Jul 2025"
      },
      {
        "title": "Veezet",
        "duration": "Jun 2022"
      },
      {
        "title": "MSocial",
        "duration": "Apr 2023 - Aug 2023"
      },
      {
        "title": "Sinaqlarim",
        "duration": "-"
      },
      {
        "title": "Woox",
        "duration": "-"
      }
    ],
    "awards": [
      "1. Matrix Academy Honours Degree Diploma (Java)",
      "2. Pasha Hackathon 3.0 (Finalist)",
      "3. Develop with aiesec",
      "4. Easy Solutions Technologies (Net & Sys Administrator)",
      "5. Easy Solutions Technologies (Network Voice Engineer)",
      "6. UNICEF"
    ],
    "certification": [],
    "languages": [],
    "volunteering": []
  }
];

// Simulate CVEditor transform function
function testScrapingDogTransform(linkedInData) {
  console.log('🎯 Testing ScrapingDog Transform...');

  // Handle array format from ScrapingDog API
  let profileData = linkedInData;
  if (Array.isArray(linkedInData) && linkedInData.length > 0) {
    profileData = linkedInData[0];
    console.log('✅ Extracted profile data from array format');
  }

  const transformedData = {
    personalInfo: {
      fullName: profileData.fullName || profileData.full_name || profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      website: profileData.public_profile_url || profileData.website || '',
      linkedin: profileData.public_profile_url || profileData.linkedin || '',
      summary: profileData.about || profileData.headline || profileData.summary || ''
    },
    // İŞ TƏCRÜBƏSI - ScrapingDog API-dən
    experience: Array.isArray(profileData.experience) ? profileData.experience.map((exp, index) => ({
      id: `exp-${Date.now()}-${index}`,
      position: exp.position || exp.title || '',
      company: exp.company_name || exp.company || '',
      startDate: exp.starts_at || exp.start_date || exp.startDate || '',
      endDate: exp.ends_at || exp.end_date || exp.endDate || '',
      description: exp.summary || exp.description || '',
      location: exp.location || ''
    })) : [],
    // TƏHSİL - ScrapingDog API-dən
    education: Array.isArray(profileData.education) ? profileData.education.map((edu, index) => ({
      id: `edu-${Date.now()}-${index}`,
      degree: edu.college_degree || edu.degree || '',
      institution: edu.college_name || edu.school || edu.institution || '',
      year: edu.college_duration || edu.duration || edu.year || '',
      description: edu.college_activity || edu.description || edu.college_degree_field || '',
      gpa: edu.gpa || ''
    })) : [],
    // DİLLƏR - ScrapingDog API-dən
    languages: Array.isArray(profileData.languages) ? profileData.languages.map((lang, index) => ({
      id: `lang-${Date.now()}-${index}`,
      name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
      proficiency: typeof lang === 'string' ? 'Professional' : lang.proficiency || 'Professional'
    })) : [],
    // LAYIHƏLƏR - ScrapingDog API-dən
    projects: Array.isArray(profileData.projects) ? profileData.projects.map((proj, index) => ({
      id: `proj-${Date.now()}-${index}`,
      name: proj.title || proj.name || '',
      description: proj.description || proj.summary || `${proj.title || proj.name || ''} layihəsi`,
      startDate: proj.duration || proj.start_date || proj.startDate || '',
      endDate: proj.end_date || proj.endDate || '',
      skills: proj.skills || proj.technologies || '',
      url: proj.link || proj.url || ''
    })) : [],
    // SERTIFIKATLAR - ScrapingDog API-dən (certification adında gəlir)
    certifications: Array.isArray(profileData.certification) ? profileData.certification.map((cert, index) => ({
      id: `cert-${Date.now()}-${index}`,
      name: cert.name || cert.title || cert.certification || '',
      issuer: cert.authority || cert.issuer || cert.organization || '',
      date: cert.start_date || cert.date || cert.issued_date || cert.duration || '',
      description: cert.description || cert.summary || ''
    })) : [],
    // KÖNÜLLÜ TƏCRÜBƏ - ScrapingDog API-dən
    volunteerExperience: Array.isArray(profileData.volunteering) ? profileData.volunteering.map((vol, index) => ({
      id: `vol-${Date.now()}-${index}`,
      organization: vol.organization || vol.company || '',
      role: vol.role || vol.title || vol.position || '',
      startDate: vol.start_date || vol.startDate || vol.date_range || '',
      endDate: vol.end_date || vol.endDate || '',
      description: vol.description || '',
      cause: vol.cause || vol.topic || ''
    })) : [],
    // AWARDS/HONORS - ScrapingDog API-dən (awards adında gəlir və string array formatında)
    honorsAwards: Array.isArray(profileData.awards) ? profileData.awards.map((award, index) => ({
      id: `award-${Date.now()}-${index}`,
      title: typeof award === 'string' ? award : award.name || award.title || '',
      issuer: typeof award === 'string' ? '' : award.organization || award.issuer || award.authority || '',
      date: typeof award === 'string' ? '' : award.duration || award.date || award.issued_date || '',
      description: typeof award === 'string' ? '' : award.summary || award.description || ''
    })) : []
  };

  return transformedData;
}

// Test the transformation
console.log('🧪 Testing ScrapingDog Data Transformation...\n');
const result = testScrapingDogTransform(scrapingDogData);

console.log('✅ TRANSFORM RESULTS:');
console.log('\n👤 ŞƏXSI MƏLUMATLAR:');
console.log('Ad:', result.personalInfo.fullName);
console.log('Summary:', result.personalInfo.summary.substring(0, 100) + '...');

console.log('\n💼 İŞ TƏCRÜBƏSI:');
console.log(`Təcrübə sayı: ${result.experience.length}`);
result.experience.forEach((exp, index) => {
  console.log(`${index + 1}. ${exp.position} @ ${exp.company} (${exp.startDate} - ${exp.endDate})`);
});

console.log('\n🎓 TƏHSİL:');
console.log(`Təhsil sayı: ${result.education.length}`);
result.education.forEach((edu, index) => {
  console.log(`${index + 1}. ${edu.degree} @ ${edu.institution} (${edu.year})`);
});

console.log('\n🚀 LAYİHƏLƏR:');
console.log(`Layihə sayı: ${result.projects.length}`);
result.projects.forEach((proj, index) => {
  console.log(`${index + 1}. ${proj.name} (${proj.startDate})`);
});

console.log('\n🏆 MÜKAFATLAR:');
console.log(`Mükafat sayı: ${result.honorsAwards.length}`);
result.honorsAwards.forEach((award, index) => {
  console.log(`${index + 1}. ${award.title}`);
});

console.log('\n🌍 DİLLƏR:');
console.log(`Dil sayı: ${result.languages.length}`);

console.log('\n🏆 SERTİFİKATLAR:');
console.log(`Sertifikat sayı: ${result.certifications.length}`);

console.log('\n❤️ KÖNÜLLÜ TƏCRÜBƏ:');
console.log(`Könüllü təcrübə sayı: ${result.volunteerExperience.length}`);

console.log('\n📊 ÜMUMI XÜLASƏ:');
console.log('✅ Mövcud bölmələr:');
console.log(`- Şəxsi məlumatlar: ${result.personalInfo.fullName ? 'VAR' : 'YOX'}`);
console.log(`- İş təcrübəsi: ${result.experience.length} ədəd`);
console.log(`- Təhsil: ${result.education.length} ədəd`);
console.log(`- Layihələr: ${result.projects.length} ədəd`);
console.log(`- Mükafatlar: ${result.honorsAwards.length} ədəd`);
console.log(`- Dillər: ${result.languages.length} ədəd`);
console.log(`- Sertifikatlar: ${result.certifications.length} ədəd`);
console.log(`- Könüllü təcrübə: ${result.volunteerExperience.length} ədəd`);
