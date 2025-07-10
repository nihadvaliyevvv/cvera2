// Test script to verify LinkedIn import transformation
const mockLinkedInData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'New York, NY',
    website: 'https://johndoe.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    summary: 'Software Engineer with 5+ years of experience'
  },
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      startDate: '2022-01',
      endDate: '2024-01',
      current: false,
      description: 'Led development of web applications',
      location: 'San Francisco, CA'
    }
  ],
  education: [
    {
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2018-09',
      endDate: '2022-06',
      current: false,
      grade: '3.8',
      description: 'Relevant coursework in software engineering'
    }
  ],
  skills: [
    { name: 'JavaScript', level: 'Expert' },
    { name: 'Python', level: 'Advanced' },
    { name: 'React', level: 'Expert' }
  ],
  languages: [
    { name: 'English', proficiency: 'Native' },
    { name: 'Spanish', proficiency: 'Professional' }
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce application',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      url: 'https://github.com/johndoe/ecommerce',
      date: '2023-05'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023-03',
      url: 'https://aws.amazon.com/certification/',
      licenseNumber: 'AWS-SA-123456'
    }
  ],
  volunteerExperience: [
    {
      organization: 'Local Food Bank',
      role: 'IT Volunteer',
      description: 'Helped maintain computer systems',
      startDate: '2022-01',
      endDate: '2023-12',
      cause: 'Hunger Relief'
    }
  ]
};

// Transform function (copy from CVEditor)
const transformLinkedInDataToCVData = (linkedInData) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  return {
    title: `${linkedInData.personalInfo?.name || 'İmport edilən'} CV`,
    templateId: '',
    data: {
      personalInfo: {
        name: linkedInData.personalInfo?.name || '',
        email: linkedInData.personalInfo?.email || '',
        phone: linkedInData.personalInfo?.phone || '',
        location: linkedInData.personalInfo?.location || '',
        website: linkedInData.personalInfo?.website || '',
        linkedin: linkedInData.personalInfo?.linkedin || '',
        summary: linkedInData.personalInfo?.summary || ''
      },
      experience: (linkedInData.experience || []).map((exp) => ({
        id: generateId(),
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        location: exp.location || ''
      })),
      education: (linkedInData.education || []).map((edu) => ({
        id: generateId(),
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        current: edu.current || false,
        gpa: edu.grade || '',
        description: edu.description || ''
      })),
      skills: (linkedInData.skills || []).map((skill) => ({
        id: generateId(),
        name: skill.name || '',
        level: skill.level || 'Intermediate',
        category: skill.category || 'General'
      })),
      languages: (linkedInData.languages || []).map((lang) => ({
        id: generateId(),
        name: lang.name || '',
        level: lang.proficiency || 'Conversational'
      })),
      projects: (linkedInData.projects || []).map((project) => ({
        id: generateId(),
        name: project.name || '',
        description: project.description || '',
        technologies: typeof project.technologies === 'string' ? 
          project.technologies.split(',').map((t) => t.trim()) : 
          (project.technologies || []),
        url: project.url || '',
        startDate: project.date || '',
        endDate: '',
        current: false
      })),
      certifications: (linkedInData.certifications || []).map((cert) => ({
        id: generateId(),
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.date || '',
        expiryDate: '',
        credentialId: cert.licenseNumber || '',
        url: cert.url || ''
      }))
    }
  };
};

console.log('Testing LinkedIn import transformation...');
const result = transformLinkedInDataToCVData(mockLinkedInData);
console.log('Transformation result:', JSON.stringify(result, null, 2));

// Verify all sections are present
console.log('\nVerification:');
console.log('- Personal Info:', result.data.personalInfo.name ? '✓' : '✗');
console.log('- Experience:', result.data.experience.length > 0 ? '✓' : '✗');
console.log('- Education:', result.data.education.length > 0 ? '✓' : '✗');
console.log('- Skills:', result.data.skills.length > 0 ? '✓' : '✗');
console.log('- Languages:', result.data.languages.length > 0 ? '✓' : '✗');
console.log('- Projects:', result.data.projects.length > 0 ? '✓' : '✗');
console.log('- Certifications:', result.data.certifications.length > 0 ? '✓' : '✗');
