export interface ParsedLinkedInData {
  personalInfo: {
    name: string;
    email: string;  
    phone: string;
    linkedin: string;
    summary: string;
    website: string;
    headline: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    jobType: string;
    skills: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    activities: string;
    grade: string;
  }>;
  skills: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    skills: string;
    url: string;
  }>;
}

export function parseLinkedInData(rawData: any, url: string): ParsedLinkedInData {
  return {
    personalInfo: {
      name: rawData.name || '',
      email: '', // LinkedIn-dən email gəlmir
      phone: '',
      linkedin: url,
      summary: rawData.about || '',
      website: '',
      headline: rawData.headline || ''
    },
    experience: rawData.experience?.map((exp: any) => ({
      company: exp.company || '',
      position: exp.position || '',
      startDate: exp.date_range ? exp.date_range.split(' - ')[0] || '' : '',
      endDate: exp.date_range ? (exp.date_range.split(' - ')[1] !== 'Present' ? exp.date_range.split(' - ')[1] || '' : '') : '',
      current: exp.date_range ? exp.date_range.includes('Present') : false,
      description: exp.description || '',
      jobType: '',
      skills: ''
    })) || [],
    education: rawData.education?.map((edu: any) => ({
      institution: edu.school || '',
      degree: edu.degree || '',
      field: edu.field_of_study || '',
      startDate: edu.date_range ? edu.date_range.split(' - ')[0] || '' : '',
      endDate: edu.date_range ? (edu.date_range.split(' - ')[1] !== 'Present' ? edu.date_range.split(' - ')[1] || '' : '') : '',
      current: edu.date_range ? edu.date_range.includes('Present') : false,
      description: '',
      activities: '',
      grade: ''
    })) || [],
    skills: rawData.skills?.map((skill: string) => ({
      name: skill,
      level: 'Intermediate' as const
    })) || [],
    languages: rawData.languages?.map((lang: any) => ({
      name: lang.name,
      proficiency: lang.proficiency || 'Native'
    })) || [],
    certifications: rawData.certifications?.map((cert: any) => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      description: cert.credential_id || ''
    })) || [],
    projects: [] // LinkedIn scraper-də projects yoxdur
  };
}
