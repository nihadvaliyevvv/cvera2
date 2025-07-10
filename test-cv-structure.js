// Test CV creation API
const testCVData = {
  title: "Test CV",
  cv_data: {
    personalInfo: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: "New York, NY",
      website: "https://johndoe.com",
      linkedin: "https://linkedin.com/in/johndoe",
      summary: "Software Engineer with 5+ years of experience"
    },
    experience: [
      {
        id: "exp1",
        company: "Tech Corp",
        position: "Senior Software Engineer",
        startDate: "2022-01",
        endDate: "2024-01",
        current: false,
        description: "Led development of web applications",
        location: "San Francisco, CA"
      }
    ],
    education: [
      {
        id: "edu1",
        institution: "Stanford University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2018-09",
        endDate: "2022-06",
        current: false,
        gpa: "3.8",
        description: "Relevant coursework in software engineering"
      }
    ],
    skills: [
      {
        id: "skill1",
        name: "JavaScript",
        level: "Expert",
        category: "Programming Languages"
      },
      {
        id: "skill2",
        name: "React",
        level: "Expert",
        category: "Frameworks"
      }
    ],
    languages: [
      {
        id: "lang1",
        name: "English",
        level: "Native"
      },
      {
        id: "lang2",
        name: "Spanish",
        level: "Professional"
      }
    ],
    projects: [
      {
        id: "proj1",
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce application",
        technologies: ["React", "Node.js", "PostgreSQL"],
        url: "https://github.com/johndoe/ecommerce",
        startDate: "2023-05",
        endDate: "",
        current: false
      }
    ],
    certifications: [
      {
        id: "cert1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "2023-03",
        expiryDate: "",
        credentialId: "AWS-SA-123456",
        url: "https://aws.amazon.com/certification/"
      }
    ],
    templateId: "template1"
  }
};

console.log('Test CV Data Structure:');
console.log('- Title:', testCVData.title);
console.log('- Personal Info Name:', testCVData.cv_data.personalInfo.name);
console.log('- Experience Count:', testCVData.cv_data.experience.length);
console.log('- Education Count:', testCVData.cv_data.education.length);
console.log('- Skills Count:', testCVData.cv_data.skills.length);
console.log('- Languages Count:', testCVData.cv_data.languages.length);
console.log('- Projects Count:', testCVData.cv_data.projects.length);
console.log('- Certifications Count:', testCVData.cv_data.certifications.length);
console.log('- Template ID:', testCVData.cv_data.templateId);

console.log('\nValidation:');
console.log('- Has required title:', !!testCVData.title);
console.log('- Has cv_data:', !!testCVData.cv_data);
console.log('- Has personalInfo:', !!testCVData.cv_data.personalInfo);
console.log('- Has name:', !!testCVData.cv_data.personalInfo.name);
console.log('- Has email:', !!testCVData.cv_data.personalInfo.email);
console.log('- All arrays are arrays:', {
  experience: Array.isArray(testCVData.cv_data.experience),
  education: Array.isArray(testCVData.cv_data.education),
  skills: Array.isArray(testCVData.cv_data.skills),
  languages: Array.isArray(testCVData.cv_data.languages),
  projects: Array.isArray(testCVData.cv_data.projects),
  certifications: Array.isArray(testCVData.cv_data.certifications)
});

console.log('\nJSON Structure is valid:', JSON.stringify(testCVData, null, 2).length > 0);
