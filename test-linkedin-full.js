// Test LinkedIn import API response structure
console.log('Testing LinkedIn import API structure...');

// Mock LinkedIn API response from RapidAPI
const mockLinkedInAPIResponse = {
  "data": {
    "full_name": "John Doe",
    "headline": "Software Engineer at Tech Corp",
    "location": "San Francisco, CA",
    "about": "Experienced software engineer with 5+ years in web development...",
    "experiences": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "start_year": 2022,
        "start_month": 1,
        "end_year": 2024,
        "end_month": 12,
        "description": "Led development of web applications",
        "skills": "JavaScript · React · Node.js · Python"
      }
    ],
    "educations": [
      {
        "school": "Stanford University",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "start_year": 2018,
        "start_month": 9,
        "end_year": 2022,
        "end_month": 6
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
    "languages": [
      {
        "name": "English",
        "proficiency": "Native"
      },
      {
        "name": "Spanish", 
        "proficiency": "Professional"
      }
    ],
    "certifications": [
      {
        "name": "AWS Certified Solutions Architect",
        "authority": "Amazon Web Services",
        "date": "2023-03-15",
        "url": "https://aws.amazon.com/certification/",
        "license_number": "AWS-SA-123456"
      },
      {
        "name": "Google Cloud Professional",
        "authority": "Google",
        "start_date": "2023-06-01",
        "end_date": "2026-06-01",
        "credential_id": "GCP-789012"
      }
    ],
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built a full-stack e-commerce application",
        "url": "https://github.com/johndoe/ecommerce",
        "date": "2023-05-01"
      }
    ],
    "volunteer": [
      {
        "organization": "Local Food Bank",
        "role": "IT Volunteer",
        "description": "Helped maintain computer systems",
        "start_date": "2022-01-01",
        "end_date": "2023-12-31",
        "cause": "Hunger Relief"
      }
    ]
  }
};

// Test extraction functions
const extractSkills = (data) => {
  const skills = [];
  
  // From direct skills array
  if (data.skills && Array.isArray(data.skills)) {
    skills.push(...data.skills);
  }
  
  // From experience skills
  if (data.experiences) {
    data.experiences.forEach((exp) => {
      if (exp.skills) {
        const expSkills = exp.skills.split(' · ').map((s) => s.trim());
        skills.push(...expSkills);
      }
    });
  }
  
  // Remove duplicates and empty values
  return [...new Set(skills.filter(Boolean))];
};

const extractCertifications = (data) => {
  console.log('Raw certifications data from LinkedIn:', JSON.stringify(data.certifications || [], null, 2));
  
  return (data.certifications || []).map((cert) => ({
    name: cert.name || cert.title || "",
    issuer: cert.authority || cert.issuer || cert.organization || "",
    date: cert.date || `${cert.start_date || ""} - ${cert.end_date || ""}`,
    url: cert.url || "",
    license_number: cert.license_number || cert.credential_id || "",
  }));
};

const extractProjects = (data) => {
  return (data.projects || []).map((project) => ({
    name: project.name || project.title || "",
    description: project.description || "",
    url: project.url || "",
    date: project.date || `${project.start_date || ""} - ${project.end_date || ""}`,
  }));
};

const extractVolunteer = (data) => {
  return (data.volunteer || data.volunteer_experience || []).map((vol) => ({
    organization: vol.organization || vol.company || "",
    role: vol.role || vol.title || vol.position || "",
    description: vol.description || "",
    start_date: vol.start_date || "",
    end_date: vol.end_date || "",
    cause: vol.cause || "",
  }));
};

// Test with mock data
const linkedinData = mockLinkedInAPIResponse.data;

console.log('\n=== Testing extraction functions ===');
console.log('Skills:', extractSkills(linkedinData));
console.log('Languages:', linkedinData.languages || []);
console.log('Certifications:', extractCertifications(linkedinData));
console.log('Projects:', extractProjects(linkedinData));
console.log('Volunteer:', extractVolunteer(linkedinData));

// Test the full mapping
const mappedData = {
  personal_info: {
    full_name: linkedinData.full_name || "",
    email: linkedinData.email || "",
    phone: linkedinData.phone || "",
    address: linkedinData.location || "",
    photo_url: linkedinData.profile_image_url || "",
    website: linkedinData.company_website || linkedinData.website || "",
    linkedin_url: linkedinData.linkedin_url || "",
    headline: linkedinData.headline || "",
  },
  summary: linkedinData.about || linkedinData.headline || "",
  experience: (linkedinData.experiences || []).map((exp) => ({
    title: exp.title || "",
    company: exp.company || "",
    location: exp.location || "",
    start_date: exp.start_year ? `${exp.start_year}-${String(exp.start_month || 1).padStart(2, '0')}` : "",
    end_date: exp.end_year ? `${exp.end_year}-${String(exp.end_month || 12).padStart(2, '0')}` : "",
    description: exp.description || "",
    is_current: exp.is_current || false,
    job_type: exp.job_type || "",
    skills: exp.skills || "",
  })),
  education: (linkedinData.educations || []).map((edu) => ({
    degree: edu.degree || "",
    institution: edu.school || "",
    field_of_study: edu.field_of_study || "",
    start_date: edu.start_year ? `${edu.start_year}-${String(edu.start_month || 9).padStart(2, '0')}` : "",
    end_date: edu.end_year ? `${edu.end_year}-${String(edu.end_month || 6).padStart(2, '0')}` : "",
    description: edu.description || "",
    activities: edu.activities || "",
    grade: edu.grade || "",
  })),
  skills: extractSkills(linkedinData),
  languages: (linkedinData.languages || []).map((lang) => ({
    name: lang.name || lang.language || "",
    proficiency: lang.proficiency || lang.level || "",
  })),
  certifications: extractCertifications(linkedinData),
  projects: extractProjects(linkedinData),
  volunteer_experience: extractVolunteer(linkedinData),
  // Additional metadata
  connections_count: linkedinData.connection_count || 0,
  followers_count: linkedinData.follower_count || 0,
  is_premium: linkedinData.is_premium || false,
  is_verified: linkedinData.is_verified || false,
};

console.log('\n=== Final mapped data ===');
console.log('Languages:', JSON.stringify(mappedData.languages, null, 2));
console.log('Certifications:', JSON.stringify(mappedData.certifications, null, 2));
console.log('Projects:', JSON.stringify(mappedData.projects, null, 2));
console.log('Volunteer Experience:', JSON.stringify(mappedData.volunteer_experience, null, 2));

console.log('\n=== Array lengths ===');
console.log('Languages:', mappedData.languages.length);
console.log('Certifications:', mappedData.certifications.length);
console.log('Projects:', mappedData.projects.length);
console.log('Volunteer Experience:', mappedData.volunteer_experience.length);
