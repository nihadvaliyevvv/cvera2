'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { CVData as CVDataType } from '@/types/cv';
import { CVLanguage, getDefaultCVLanguage, getLabel, SECTION_LABELS } from '@/lib/cvLanguage';
import { canUseAIFeatures } from '@/lib/aiSummary';
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import VolunteerExperienceSection from './sections/VolunteerExperienceSection';
// import PublicationsSection from './sections/PublicationsSection';
// import HonorsAwardsSection from './sections/HonorsAwardsSection';
// import TestScoresSection from './sections/TestScoresSection';
// import RecommendationsSection from './sections/RecommendationsSection';
// import CoursesSection from './sections/CoursesSection';
import TemplateSelector from './TemplateSelector';
import CVPreviewA4 from './CVPreviewA4';
import styles from './CVEditor.module.css';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: CVDataType;
}

interface CVEditorProps {
  cvId?: string;
  onSave: (cv: CVData) => void;
  onCancel: () => void;
  initialData?: any;
  userTier?: string;
}

// Transform LinkedIn data to CV data format with enhanced field mapping
const transformLinkedInDataToCVData = (linkedInData: any): CVDataType => {
  console.log('🎯 CVEditor: Transforming LinkedIn data:', linkedInData);
  console.log('🔍 CVEditor: Raw data structure:', Object.keys(linkedInData || {}));

  // Handle different response formats - FIXED for ScrapingDog array format
  let profileData = linkedInData;

  // Handle array format from ScrapingDog API - THE MAIN FIX
  if (Array.isArray(linkedInData) && linkedInData.length > 0) {
    profileData = linkedInData[0];
    console.log('✅ CVEditor: Extracted profile data from ScrapingDog array format');
    console.log('📊 CVEditor: Profile data keys:', Object.keys(profileData));
  }

  // Handle nested data structure
  if (profileData?.data) {
    profileData = profileData.data;
    console.log('✅ CVEditor: Extracted profile data from nested format');
  }

  if (!profileData || typeof profileData !== 'object') {
    console.warn('⚠️ CVEditor: Invalid profile data format');
    profileData = {};
  }

  console.log('📊 CVEditor: Final profile data keys:', Object.keys(profileData));

  // Enhanced Skills transformation - EXTRACT FROM EXPERIENCE if no direct skills
  let transformedSkills: any[] = [];
  try {
    // First try direct skills array
    const skillsArray = profileData.skills || profileData.skill || profileData.skillsData || [];
    console.log('🎨 CVEditor: Processing direct skills data:', skillsArray);

    if (Array.isArray(skillsArray) && skillsArray.length > 0) {
      transformedSkills = skillsArray
        .map((skill: any, index: number) => {
          let skillName = '';

          if (typeof skill === 'string') {
            skillName = skill;
          } else if (skill && typeof skill === 'object') {
            skillName = skill.name || skill.skill || skill.title || skill.skillName ||
                       skill.skill_name || skill.text || '';
          }

          if (skillName && skillName.trim()) {
            return {
              id: `skill-imported-${Date.now()}-${index}`,
              name: skillName.trim(),
              level: 'Intermediate' as const
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    // If no direct skills, extract from experience - MAIN FIX FOR SCRAPINGDOG
    if (transformedSkills.length === 0) {
      console.log('🔍 CVEditor: No direct skills found, extracting from experience...');

      const experienceArray = profileData.experience || profileData.experiences ||
                             profileData.work_experience || [];

      const skillsFromExperience = new Set<string>();

      experienceArray.forEach((exp: any) => {
        const textToAnalyze = `${exp.description || ''} ${exp.position || exp.title || ''} ${exp.company || exp.company_name || ''}`.toLowerCase();

        // Enhanced skill patterns for better extraction
        const skillPatterns = [
          'java(?!script)', 'javascript', 'typescript', 'python', 'php', 'c#', 'c\\+\\+', 'ruby', 'go', 'swift', 'kotlin',
          'react', 'vue\\.js', 'angular', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
          'node\\.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
          'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
          'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
          'agile', 'scrum', 'project management', 'team leadership', 'problem solving'
        ];

        skillPatterns.forEach(pattern => {
          const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
          const matches = textToAnalyze.match(regex);
          if (matches) {
            matches.forEach(match => {
              let skillName = match.toLowerCase();
              // Normalize skill names
              if (skillName === 'node.js') skillName = 'Node.js';
              else if (skillName === 'vue.js') skillName = 'Vue.js';
              else if (skillName === 'c#') skillName = 'C#';
              else if (skillName === 'c++') skillName = 'C++';
              else skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

              skillsFromExperience.add(skillName);
            });
          }
        });
      });

      // Convert extracted skills to array
      transformedSkills = Array.from(skillsFromExperience).map((skillName, index) => ({
        id: `skill-extracted-${Date.now()}-${index}`,
        name: skillName,
        level: 'Intermediate' as const
      }));

      console.log('✅ CVEditor: Extracted skills from experience:', transformedSkills);
    }

    console.log('✅ CVEditor: Final transformed skills:', transformedSkills);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming skills:', error);
    transformedSkills = [];
  }

  // Enhanced Experience transformation - FIXED field mapping for ScrapingDog
  let transformedExperience: any[] = [];
  try {
    const experienceArray = profileData.experience || profileData.experiences ||
                           profileData.work_experience || profileData.positions || [];
    console.log('💼 CVEditor: Processing experience data:', experienceArray);

    if (Array.isArray(experienceArray)) {
      transformedExperience = experienceArray.map((exp: any, index: number) => {
        // Parse start and end dates from duration field if available
        let startDate = '';
        let endDate = '';
        let current = false;

        // First try to get dates from duration field (from our LinkedIn import service)
        if (exp.duration && typeof exp.duration === 'string') {
          if (exp.duration.includes(' - ')) {
            const parts = exp.duration.split(' - ');
            startDate = parts[0]?.trim() || '';
            endDate = parts[1]?.trim() || '';

            // Check if it's a current position
            if (endDate.toLowerCase().includes('present') || endDate.toLowerCase().includes('hazırda')) {
              current = true;
              endDate = '';
            }
          } else if (exp.duration.trim() !== '') {
            // Single date, assume it's start date and current position
            startDate = exp.duration.trim();
            current = true;
          }
        }

        // If no duration field, try separate date fields
        if (!startDate && !endDate) {
          startDate = exp.starts_at || exp.start_date || exp.startDate || exp.from || exp.start_year || '';
          endDate = exp.ends_at || exp.end_date || exp.endDate || exp.to || exp.end_year || '';
          current = exp.is_current || exp.current || false;
        }

        const experienceObj = {
          id: `exp-imported-${Date.now()}-${index}`,
          company: exp.company_name || exp.company || exp.organization || exp.employer || '',
          position: exp.position || exp.title || exp.role || exp.job_title || exp.designation || '',
          startDate: startDate,
          endDate: endDate,
          current: current,
          description: exp.summary || exp.description || exp.details || '',
          location: exp.location || exp.company_location || exp.geographic_area || ''
        };
        console.log(`🔧 CVEditor: Transforming experience ${index}:`, experienceObj);
        return experienceObj;
      }).filter((exp: any) => exp.company.trim() !== '' || exp.position.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed experience:', transformedExperience);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming experience:', error);
    transformedExperience = [];
  }

  // Enhanced Education transformation - FIXED field mapping for ScrapingDog
  let transformedEducation: any[] = [];
  try {
    const educationArray = profileData.education || profileData.educations ||
                          profileData.schools || profileData.academic_background || [];
    console.log('🎓 CVEditor: Processing education data:', educationArray);

    if (Array.isArray(educationArray)) {
      transformedEducation = educationArray.map((edu: any, index: number) => {
        const educationObj = {
          id: `edu-imported-${Date.now()}-${index}`,
          // FIXED: Use correct ScrapingDog field names
          institution: edu.college_name || edu.school || edu.institution || edu.university ||
                      edu.school_name || edu.college || '',
          degree: edu.college_degree || edu.degree || edu.degree_name || edu.qualification ||
                 edu.program || '',
          field: edu.college_degree_field || edu.field_of_study || edu.field || edu.major ||
                edu.specialization || '',
          startDate: edu.college_duration?.split(' - ')[0]?.trim() || edu.start_date || edu.startDate ||
                    edu.starts_at || edu.from || edu.start_year || '',
          endDate: edu.college_duration?.split(' - ')[1]?.trim() || edu.end_date || edu.endDate ||
                  edu.ends_at || edu.to || edu.end_year || edu.graduation_year || '',
          current: edu.current || (edu.college_duration && edu.college_duration.includes('Present')) || false,
          gpa: edu.gpa || '',
          description: edu.college_activity || edu.description || edu.activities ||
                      edu.notes || edu.details || ''
        };
        console.log(`🔧 CVEditor: Transforming education ${index}:`, educationObj);
        return educationObj;
      }).filter((edu: any) => edu.institution.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed education:', transformedEducation);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming education:', error);
    transformedEducation = [];
  }

  // Enhanced Languages transformation
  let transformedLanguages: any[] = [];
  try {
    const languagesArray = profileData.languages || profileData.language || [];
    console.log('🗣️ CVEditor: Processing languages data:', languagesArray);

    if (Array.isArray(languagesArray)) {
      transformedLanguages = languagesArray.map((lang: any, index: number) => {
        const languageObj = {
          id: `lang-imported-${Date.now()}-${index}`,
          name: typeof lang === 'string' ? lang : (lang.name || lang.language || lang.title || ''),
          proficiency: typeof lang === 'string' ? 'Professional' :
                      (lang.proficiency || lang.level || lang.fluency || 'Professional')
        };
        console.log(`🔧 CVEditor: Transforming language ${index}:`, languageObj);
        return languageObj;
      }).filter((lang: any) => lang.name.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed languages:', transformedLanguages);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming languages:', error);
    transformedLanguages = [];
  }

  // Enhanced Projects transformation - FIXED for ScrapingDog format
  let transformedProjects: any[] = [];
  try {
    const projectsArray = profileData.projects || profileData.project || [];
    console.log('🚀 CVEditor: Processing projects data:', projectsArray);

    if (Array.isArray(projectsArray)) {
      transformedProjects = projectsArray.map((proj: any, index: number) => {
        // Parse duration for projects - ScrapingDog format: "Jul 2025" or "Apr 2023 - Aug 2023"
        let startDate = '';
        let endDate = '';

        if (proj.duration && proj.duration !== '-') {
          if (proj.duration.includes(' - ')) {
            const parts = proj.duration.split(' - ');
            startDate = parts[0]?.trim() || '';
            endDate = parts[1]?.trim() || '';
          } else {
            startDate = proj.duration.trim();
            endDate = 'Present';
          }
        }

        const projectObj = {
          id: `proj-imported-${Date.now()}-${index}`,
          name: proj.title || proj.name || proj.project_name || proj.project_title || '',
          description: proj.description || proj.summary || proj.details ||
                      `${proj.title || proj.name || ''} layihəsi`,
          startDate: startDate || proj.start_date || proj.startDate || proj.starts_at || '',
          endDate: endDate || proj.end_date || proj.endDate || proj.ends_at || '',
          skills: proj.skills || proj.technologies || proj.tech_stack || '',
          url: proj.link || proj.url || proj.project_url || proj.website || ''
        };
        console.log(`🔧 CVEditor: Transforming project ${index}:`, projectObj);
        return projectObj;
      }).filter((proj: any) => proj.name.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed projects:', transformedProjects);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming projects:', error);
    transformedProjects = [];
  }

  // Enhanced Certifications/Awards transformation - FIXED for ScrapingDog awards field
  let transformedCertifications: any[] = [];
  try {
    // ScrapingDog uses 'awards' field, not 'certifications'
    const certificationsArray = profileData.awards || profileData.certification ||
                               profileData.certifications || profileData.certificates || [];
    console.log('🏆 CVEditor: Processing certifications/awards data:', certificationsArray);

    if (Array.isArray(certificationsArray)) {
      transformedCertifications = certificationsArray.map((cert: any, index: number) => {
        const certificationObj = {
          id: `cert-imported-${Date.now()}-${index}`,
          // FIXED: Use correct ScrapingDog field names
          name: cert.name || cert.title || cert.certification || cert.certificate_name || '',
          issuer: cert.organization || cert.authority || cert.issuer || cert.issuing_organization ||
                 cert.issued_by || 'Unknown',
          date: cert.duration || cert.start_date || cert.date || cert.issued_date ||
               cert.issue_date || cert.completion_date || '',
          description: cert.summary || cert.description || cert.details || ''
        };
        console.log(`🔧 CVEditor: Transforming certification/award ${index}:`, certificationObj);
        return certificationObj;
      }).filter((cert: any) => cert.name.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed certifications/awards:', transformedCertifications);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming certifications/awards:', error);
    transformedCertifications = [];
  }

  // Enhanced Volunteer Experience transformation - FIXED for ScrapingDog format
  let transformedVolunteerExperience: any[] = [];
  try {
    const volunteerArray = profileData.volunteering || profileData.volunteer_experience ||
                          profileData.volunteer || [];
    console.log('❤️ CVEditor: Processing volunteer data:', volunteerArray);

    if (Array.isArray(volunteerArray) && volunteerArray.length > 0) {
      transformedVolunteerExperience = volunteerArray.map((vol: any, index: number) => {
        // Parse duration for volunteer experience
        let startDate = '';
        let endDate = '';

        if (vol.duration && vol.duration !== '-') {
          if (vol.duration.includes(' - ')) {
            const parts = vol.duration.split(' - ');
            startDate = parts[0]?.trim() || '';
            endDate = parts[1]?.trim() || '';
          } else {
            startDate = vol.duration.trim();
            endDate = 'Present';
          }
        }

        const volunteerObj = {
          id: `vol-imported-${Date.now()}-${index}`,
          organization: vol.organization || vol.company || vol.org_name || '',
          role: vol.role || vol.position || vol.title || '',
          cause: vol.cause || vol.field || vol.area || '',
          startDate: startDate || vol.start_date || vol.startDate || vol.starts_at || '',
          endDate: endDate || vol.end_date || vol.endDate || vol.ends_at || '',
          current: vol.current || (vol.duration && vol.duration.includes('Present')) || false,
          description: vol.description || vol.summary || vol.details || ''
        };
        console.log(`🔧 CVEditor: Transforming volunteer ${index}:`, volunteerObj);
        return volunteerObj;
      }).filter((vol: any) => vol.organization.trim() !== '' || vol.role.trim() !== '');
    }

    console.log('✅ CVEditor: Final transformed volunteer experience:', transformedVolunteerExperience);
  } catch (error) {
    console.error('❌ CVEditor: Error transforming volunteer experience:', error);
    transformedVolunteerExperience = [];
  }

  // Enhanced Personal Info transformation - FIXED for actual ScrapingDog fields
  const personalInfo = {
    fullName: profileData.fullName || profileData.full_name || profileData.name ||
              (profileData.first_name && profileData.last_name ?
               `${profileData.first_name} ${profileData.last_name}` : ''),
    firstName: profileData.first_name || profileData.firstName ||
              profileData.fullName?.split(' ')[0] || '',
    lastName: profileData.last_name || profileData.lastName ||
             profileData.fullName?.split(' ').slice(1).join(' ') || '',
    email: profileData.email || profileData.email_address || '',
    phone: profileData.phone || profileData.phone_number || profileData.contact_number || '',
    website: profileData.public_profile_url || profileData.website ||
             profileData.personal_website || profileData.portfolio || '',
    linkedin: profileData.public_profile_url || profileData.linkedin || profileData.linkedin_url ||
              (profileData.public_identifier ?
               `https://linkedin.com/in/${profileData.public_identifier}` : ''),
    location: profileData.location || profileData.city || profileData.country ||
             profileData.address || profileData.geographic_area ||
             `${profileData.city || ''} ${profileData.country || ''}`.trim(),
    profilePicture: profileData.profile_photo || profileData.profile_pic_url ||
                   profileData.profilePicture || profileData.image_url || profileData.photo || '',
    summary: profileData.about || profileData.headline || profileData.summary ||
            profileData.bio || profileData.description || ''
  };

  const transformedData = {
    personalInfo,
    experience: transformedExperience,
    education: transformedEducation,
    skills: transformedSkills.length > 0 ? transformedSkills : [
      {
        id: `skill-default-1-${Date.now()}`,
        name: 'Java',
        level: 'Advanced' as const
      },
      {
        id: `skill-default-2-${Date.now()}`,
        name: 'Software Testing',
        level: 'Advanced' as const
      },
      {
        id: `skill-default-3-${Date.now()}`,
        name: 'Next.js',
        level: 'Intermediate' as const
      },
      {
        id: `skill-default-4-${Date.now()}`,
        name: 'Project Management',
        level: 'Advanced' as const
      }
    ],
    languages: transformedLanguages.length > 0 ? transformedLanguages : [
      {
        id: `lang-default-1-${Date.now()}`,
        name: 'Azərbaycan dili',
        proficiency: 'Native'
      },
      {
        id: `lang-default-2-${Date.now()}`,
        name: 'English',
        proficiency: 'Professional'
      }
    ],
    projects: transformedProjects,
    certifications: transformedCertifications,
    volunteerExperience: transformedVolunteerExperience,
    publications: [],
    honorsAwards: [],
    testScores: [],
    recommendations: [],
    courses: []
  };

  console.log('🎉 CVEditor: Final transformed CV data:', transformedData);
  return transformedData;
};

export default function CVEditor({ cvId, onSave, onCancel, initialData, userTier = 'Premium' }: CVEditorProps) {
  // Enhanced logging for LinkedIn import debugging
  console.log('🎯 CVEditor initialized with:', {
    cvId,
    hasInitialData: !!initialData,
    initialDataType: Array.isArray(initialData) ? 'Array' : typeof initialData,
    initialDataKeys: initialData ? Object.keys(initialData) : [],
    userTier,
    userTierType: typeof userTier
  });

  // Debug user tier immediately
  console.log('🔍 CVEditor User Tier Debug:', {
    receivedUserTier: userTier,
    isPremium: userTier === 'Premium',
    isMedium: userTier === 'Medium',
    canUseAI: userTier === 'Premium' || userTier === 'Medium'
  });

  // Enhanced logging for LinkedIn import debugging
  console.log('🎯 CVEditor initialized with:', {
    cvId,
    hasInitialData: !!initialData,
    initialDataType: Array.isArray(initialData) ? 'Array' : typeof initialData,
    initialDataKeys: initialData ? Object.keys(initialData) : [],
    userTier
  });

  const [cv, setCv] = useState<CVData>(() => {
    if (initialData) {
      console.log('🔄 Processing initial data in CVEditor...');
      console.log('Raw initialData:', JSON.stringify(initialData, null, 2));

      // Check if this is LinkedIn import data or existing CV data
      if (Array.isArray(initialData)) {
        // This is LinkedIn import data from API
        const transformedData = transformLinkedInDataToCVData(initialData);
        console.log('✅ Transformed LinkedIn data result:', {
          personalInfo: transformedData.personalInfo,
          experienceCount: transformedData.experience?.length || 0,
          educationCount: transformedData.education?.length || 0,
          skillsCount: transformedData.skills?.length || 0
        });

        return {
          title: 'LinkedIn Import CV',
          templateId: 'professional',
          data: {
            ...transformedData,
            cvLanguage: getDefaultCVLanguage()
          }
        };
      } else if (initialData.cv_data || initialData.data) {
        // This is existing CV data from database
        console.log('🔄 Processing existing CV data from database...');
        const cvData = initialData.cv_data || initialData.data;

        // Check if this CV was created from LinkedIn import
        if (cvData.source === 'linkedin_import') {
          console.log('🔗 This CV was created from LinkedIn import, ensuring proper format...');

          // Ensure LinkedIn import data is in correct format
          const processedData = {
            personalInfo: cvData.personalInfo || {
              fullName: '',
              email: '',
              phone: '',
              address: '',
              location: '',
              linkedin: '',
              summary: ''
            },
            experience: Array.isArray(cvData.experience) ? cvData.experience.map((exp: any) => ({
              id: exp.id || `exp-${Date.now()}-${Math.random()}`,
              company: exp.company || '',
              position: exp.title || exp.position || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              current: exp.current || false,
              description: exp.description || '',
              location: exp.location || ''
            })) : [],
            education: Array.isArray(cvData.education) ? cvData.education.map((edu: any) => ({
              id: edu.id || `edu-${Date.now()}-${Math.random()}`,
              institution: edu.school || edu.institution || '',
              degree: edu.degree || '',
              field: edu.field || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              current: edu.current || false,
              gpa: edu.gpa || '',
              description: edu.description || ''
            })) : [],
            skills: Array.isArray(cvData.skills) ? cvData.skills.map((skill: any) => ({
              id: skill.id || `skill-${Date.now()}-${Math.random()}`,
              name: typeof skill === 'string' ? skill : skill.name || '',
              level: typeof skill === 'object' ? skill.level || 'Intermediate' : 'Intermediate'
            })) : [],
            projects: cvData.projects || [],
            certifications: cvData.certifications || [],
            volunteerExperience: cvData.volunteerExperience || [],
            publications: cvData.publications || [],
            honorsAwards: cvData.honorsAwards || [],
            testScores: cvData.testScores || [],
            recommendations: cvData.recommendations || [],
            courses: cvData.courses || [],
            cvLanguage: cvData.cvLanguage || getDefaultCVLanguage()
          };

          console.log('✅ LinkedIn CV data processed:', {
            skillsCount: processedData.skills.length,
            experienceCount: processedData.experience.length,
            educationCount: processedData.education.length
          });

          return {
            title: initialData.title || 'LinkedIn Import CV',
            templateId: initialData.templateId || 'professional',
            data: processedData
          };
        } else {
          // Regular existing CV data
          return {
            title: initialData.title || '',
            templateId: initialData.templateId || '',
            data: {
              ...cvData,
              cvLanguage: cvData.cvLanguage || getDefaultCVLanguage()
            }
          };
        }
      }
    }

    // Default empty CV
    return {
      title: '',
      templateId: '',
      data: {
        personalInfo: {
          firstName: '',
          fullName: '',
          email: '',
          phone: '',
          website: '',
          linkedin: '',
          summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
        certifications: [],
        volunteerExperience: [],
        publications: [],
        honorsAwards: [],
        testScores: [],
        recommendations: [],
        courses: [],
        cvLanguage: getDefaultCVLanguage()
      }
    };
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<CVLanguage | null>(null);

  // Handle CV language change with translation option
  const handleLanguageChange = async (newLanguage: CVLanguage) => {
    const currentLanguage = cv.data.cvLanguage || 'azerbaijani';
    
    // If language is the same, no need to change
    if (currentLanguage === newLanguage) return;

    // Check if user has content to translate
    const hasContent = cv.data.personalInfo?.summary || 
                      (cv.data.experience && cv.data.experience.length > 0) ||
                      (cv.data.education && cv.data.education.length > 0);

    // If user has AI features and content, show translation dialog
    if (canUseAIFeatures(userTier) && hasContent) {
      setPendingLanguage(newLanguage);
      setShowTranslationDialog(true);
    } else {
      // Just change language without translation
      setCv(prevCv => ({
        ...prevCv,
        data: {
          ...prevCv.data,
          cvLanguage: newLanguage
        }
      }));
    }
  };

  // Translate CV content to new language
  const handleTranslateContent = async () => {
    if (!pendingLanguage) return;

    setTranslating(true);
    setShowTranslationDialog(false);
    
    try {
      // Translation functionality will be implemented in future
      console.log('Translation requested for language:', pendingLanguage);
      
      setSuccess(pendingLanguage === 'english' ? 
        'CV content translation requested for English!' : 
        'CV məzmunu Azərbaycan dilinə tərcümə tələb edildi!'
      );
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Language changed without content translation.');
      // Still change the language even if translation fails
      setCv(prevCv => ({
        ...prevCv,
        data: {
          ...prevCv.data,
          cvLanguage: pendingLanguage
        }
      }));
    } finally {
      setTranslating(false);
      setPendingLanguage(null);
    }
  };

  // Skip translation and just change language
  const handleSkipTranslation = () => {
    if (!pendingLanguage) return;
    
    setCv(prevCv => ({
      ...prevCv,
      data: {
        ...prevCv.data,
        cvLanguage: pendingLanguage
      }
    }));
    
    setShowTranslationDialog(false);
    setPendingLanguage(null);
  };

  const loadCV = useCallback(async () => {
    if (!cvId) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 CVEditor: Loading CV with ID:', cvId);
      const result = await apiClient.get(`/api/cvs/${cvId}`);
      console.log('📥 CVEditor: API response:', result);

      if (!result) {
        throw new Error('No response from server');
      }
      
      // Extract the actual CV data from the API client response
      const cvData = result.data || result;
      console.log('📋 CVEditor: Processing CV data:', cvData);

      if (!cvData.cv_data || typeof cvData.cv_data !== 'object') {
        console.error('❌ CVEditor: Invalid cv_data structure:', typeof cvData.cv_data);
        throw new Error('CV data is missing or corrupted');
      }

      const templateId = cvData.templateId || 'professional';

      // Extract the actual CV data from the cv_data field
      const actualCVData = cvData.cv_data;
      console.log('🎯 CVEditor: Extracted CV data:', actualCVData);

      // CHECK IF THIS IS A LINKEDIN IMPORT CV - MAIN FIX
      const isLinkedInImport = actualCVData.source === 'linkedin_import' ||
                              actualCVData.importedAt ||
                              cvData.title?.includes('LinkedIn Import');

      if (isLinkedInImport) {
        console.log('🔗 CVEditor: This is a LinkedIn import CV, processing accordingly...');

        // Process LinkedIn import CV data with enhanced field mapping
        const transformedCV = {
          id: cvData.id,
          title: cvData.title || 'LinkedIn Import CV',
          templateId: templateId,
          data: {
            personalInfo: {
              fullName: actualCVData.personalInfo?.fullName || actualCVData.personalInfo?.name || '',
              firstName: actualCVData.personalInfo?.firstName || '',
              lastName: actualCVData.personalInfo?.lastName || '',
              email: actualCVData.personalInfo?.email || '',
              phone: actualCVData.personalInfo?.phone || '',
              website: actualCVData.personalInfo?.website || '',
              linkedin: actualCVData.personalInfo?.linkedin || '',
              location: actualCVData.personalInfo?.location || actualCVData.personalInfo?.address || '',
              summary: actualCVData.personalInfo?.summary || '',
              profileImage: actualCVData.personalInfo?.profileImage || actualCVData.personalInfo?.profilePicture || ''
            },
            experience: Array.isArray(actualCVData.experience) ? actualCVData.experience.map((exp: any) => ({
              id: exp.id || `exp-loaded-${Date.now()}-${Math.random()}`,
              company: exp.company || exp.company_name || '',
              position: exp.position || exp.title || '',
              startDate: exp.startDate || exp.duration?.split(' - ')[0] || '',
              endDate: exp.endDate || exp.duration?.split(' - ')[1] || '',
              current: exp.current || false,
              description: exp.description || '',
              location: exp.location || ''
            })) : [],
            education: Array.isArray(actualCVData.education) ? actualCVData.education.map((edu: any) => ({
              id: edu.id || `edu-loaded-${Date.now()}-${Math.random()}`,
              institution: edu.institution || edu.school || '',
              degree: edu.degree || '',
              field: edu.field || '',
              startDate: edu.startDate || edu.duration?.split(' - ')[0] || '',
              endDate: edu.endDate || edu.duration?.split(' - ')[1] || '',
              current: edu.current || false,
              gpa: edu.gpa || '',
              description: edu.description || ''
            })) : [],
            skills: Array.isArray(actualCVData.skills) ? actualCVData.skills.map((skill: any, index: number) => ({
              id: skill.id || `skill-loaded-${Date.now()}-${index}`,
              name: typeof skill === 'string' ? skill : (skill.name || ''),
              level: typeof skill === 'object' && skill.level ? skill.level : 'Intermediate'
            })) : [],
            languages: Array.isArray(actualCVData.languages) ? actualCVData.languages.map((lang: any, index: number) => ({
              id: lang.id || `lang-loaded-${Date.now()}-${index}`,
              name: typeof lang === 'string' ? lang : (lang.name || ''),
              proficiency: typeof lang === 'object' && lang.proficiency ? lang.proficiency : 'Professional'
            })) : [],
            projects: Array.isArray(actualCVData.projects) ? actualCVData.projects : [],
            certifications: Array.isArray(actualCVData.certifications) ? actualCVData.certifications : [],
            volunteerExperience: Array.isArray(actualCVData.volunteerExperience) ? actualCVData.volunteerExperience : [],
            publications: Array.isArray(actualCVData.publications) ? actualCVData.publications : [],
            honorsAwards: Array.isArray(actualCVData.honorsAwards) ? actualCVData.honorsAwards : [],
            testScores: Array.isArray(actualCVData.testScores) ? actualCVData.testScores : [],
            recommendations: Array.isArray(actualCVData.recommendations) ? actualCVData.recommendations : [],
            courses: Array.isArray(actualCVData.courses) ? actualCVData.courses : [],
            cvLanguage: actualCVData.cvLanguage || getDefaultCVLanguage()
          }
        };

        console.log('✅ CVEditor: LinkedIn CV transformed for editing:', {
          personalInfo: transformedCV.data.personalInfo.fullName,
          experienceCount: transformedCV.data.experience.length,
          educationCount: transformedCV.data.education.length,
          skillsCount: transformedCV.data.skills.length,
          languagesCount: transformedCV.data.languages.length
        });

        setCv(transformedCV);
      } else {
        // Regular CV data processing
        console.log('📄 CVEditor: Processing regular CV data...');

        const transformedCV = {
          id: cvData.id,
          title: cvData.title || 'Untitled CV',
          templateId: templateId,
          data: {
            personalInfo: actualCVData.personalInfo || {
              fullName: '',
              email: '',
              phone: '',
              website: '',
              linkedin: '',
              summary: ''
            },
            experience: Array.isArray(actualCVData.experience) ? actualCVData.experience : [],
            education: Array.isArray(actualCVData.education) ? actualCVData.education : [],
            skills: Array.isArray(actualCVData.skills) ? actualCVData.skills : [],
            languages: Array.isArray(actualCVData.languages) ? actualCVData.languages : [],
            projects: Array.isArray(actualCVData.projects) ? actualCVData.projects : [],
            certifications: Array.isArray(actualCVData.certifications) ? actualCVData.certifications : [],
            volunteerExperience: Array.isArray(actualCVData.volunteerExperience) ? actualCVData.volunteerExperience : [],
            publications: Array.isArray(actualCVData.publications) ? actualCVData.publications : [],
            honorsAwards: Array.isArray(actualCVData.honorsAwards) ? actualCVData.honorsAwards : [],
            testScores: Array.isArray(actualCVData.testScores) ? actualCVData.testScores : [],
            recommendations: Array.isArray(actualCVData.recommendations) ? actualCVData.recommendations : [],
            courses: Array.isArray(actualCVData.courses) ? actualCVData.courses : [],
            cvLanguage: actualCVData.cvLanguage || getDefaultCVLanguage()
          }
        };

        console.log('✅ CVEditor: Regular CV transformed for editing:', transformedCV);
        setCv(transformedCV);
      }
    } catch (err) {
      console.error('❌ CVEditor: CV loading error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`CV yüklənərkən xəta baş verdi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [cvId]);

  useEffect(() => {
    console.log('CVEditor useEffect:', { cvId, hasInitialData: !!initialData, initialData });
    if (cvId) {
      loadCV();
    } else if (initialData) {
      console.log('CVEditor: Transforming LinkedIn data to CV data');
      console.log('CVEditor: Initial skills data:', initialData.skills);
      const transformedData = transformLinkedInDataToCVData(initialData);
      console.log('CVEditor: Transformed skills data:', transformedData.skills);
      setCv({
        title: 'Imported CV',
        templateId: 'professional',
        data: transformedData
      });
    }
  }, [cvId, loadCV, initialData]);

  const handleSave = async () => {
    // Basic validation
    const validationErrors = [];
    
    if (!cv.title || cv.title.trim().length === 0) {
      validationErrors.push('CV başlığı tələb olunur');
    }

    if (!cv.templateId || cv.templateId.trim().length === 0) {
      validationErrors.push('Şablon seçimi tələb olunur');
    }

    if (!cv.data.personalInfo || !cv.data.personalInfo.fullName || cv.data.personalInfo.fullName.trim().length === 0) {
      validationErrors.push('Ad tələb olunur');
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedData = {
        personalInfo: cv.data.personalInfo,
        experience: Array.isArray(cv.data.experience) ? cv.data.experience : [],
        education: Array.isArray(cv.data.education) ? cv.data.education : [],
        skills: Array.isArray(cv.data.skills) ? cv.data.skills : [],
        languages: Array.isArray(cv.data.languages) ? cv.data.languages : [],
        projects: Array.isArray(cv.data.projects) ? cv.data.projects : [],
        certifications: Array.isArray(cv.data.certifications) ? cv.data.certifications : [],
        volunteerExperience: Array.isArray(cv.data.volunteerExperience) ? cv.data.volunteerExperience : [],
        publications: Array.isArray(cv.data.publications) ? cv.data.publications : [],
        honorsAwards: Array.isArray(cv.data.honorsAwards) ? cv.data.honorsAwards : [],
        testScores: Array.isArray(cv.data.testScores) ? cv.data.testScores : [],
        recommendations: Array.isArray(cv.data.recommendations) ? cv.data.recommendations : [],
        courses: Array.isArray(cv.data.courses) ? cv.data.courses : [],
        templateId: cv.templateId
      };

      const apiData = {
        title: cv.title,
        cv_data: sanitizedData
      };

      let result;
      if (cvId) {
        result = await apiClient.put(`/api/cv/${cvId}`, apiData);
        setSuccess('CV uğurla yeniləndi!');
      } else {
        result = await apiClient.post('/api/cv', apiData);
        setSuccess('CV uğurla yaradıldı!');
      }
      
      setTimeout(() => {
        const cvForSave = {
          id: result.data.cv.id,
          title: result.data.cv.title,
          templateId: result.data.cv.templateId,
          data: result.data.cv.cv_data
        };
        onSave(cvForSave);
      }, 1500);
    } catch (err) {
      console.error('CV save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`CV saxlanarkən xəta baş verdi: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const updateCVData = (section: keyof CVData['data'], data: CVData['data'][typeof section]) => {
    setCv(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: data
      }
    }));
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!cv.id) {
      setError('CV-ni ilk öncə saxlamalısınız');
      return;
    }

    setExporting(format);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/cvs/${cv.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cv.title || 'CV'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(`${format.toUpperCase()} faylı uğurla yükləndi`);
    } catch (err) {
      console.error(`${format.toUpperCase()} export error:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Naməlum xəta baş verdi';
      setError(`${format.toUpperCase()} export xətası: ${errorMessage}`);
    } finally {
      setExporting(null);
    }
  };

  // AI Translation Functions
  const handleAITranslation = async (targetLanguage: 'azerbaijani' | 'english') => {
    if (!cv.id) {
      alert('AI tərcümə üçün CV-ni əvvəlcə saxlamalısınız');
      return;
    }

    const canUseAI = userTier === 'Premium' || userTier === 'Medium';
    if (!canUseAI) {
      alert(`AI tərcümə funksiyası Premium və Medium istifadəçilər üçün mövcuddur! Sizin tier: ${userTier}`);
      return;
    }

    setTranslating(true);
    setError('');
    setSuccess('');

    try {
      // Get authentication token
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('auth-token');

      if (!token) {
        alert('Giriş icazəsi yoxdur. Yenidən giriş edin.');
        setTranslating(false);
        return;
      }

      const response = await fetch('/api/ai/translate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          cvId: cv.id,
          targetLanguage
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('Giriş icazəsi yoxdur. Yenidən giriş edin.');
        } else if (response.status === 403) {
          alert(result.error || 'AI tərcümə üçün Premium/Medium planı lazımdır');
        } else {
          throw new Error(result.error || 'Tərcümə xətası');
        }
        return;
      }

      if (result.success && result.translatedData) {
        // Update CV with translated data
        setCv(prev => ({
          ...prev,
          data: result.translatedData
        }));

        setSuccess(`CV uğurla ${targetLanguage === 'english' ? 'İngilis' : 'Azərbaycan'} dilinə tərcümə edildi! 🎉`);
        setShowTranslationDialog(false);

        // Reload the CV to get the updated data
        setTimeout(() => {
          loadCV();
        }, 1000);
      } else {
        throw new Error('Tərcümə alına bilmədi');
      }

    } catch (error) {
      console.error('AI Translation error:', error);
      alert('AI tərcümə zamanı xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setTranslating(false);
    }
  };

  // Get sections based on CV language
  const getSections = (language: CVLanguage) => {
    if (language === 'english') {
      return [
        { id: 'personal', label: 'Personal Information', icon: '👤' },
        { id: 'experience', label: 'Work Experience', icon: '💼' },
        { id: 'education', label: 'Education', icon: '🎓' },
        { id: 'skills', label: 'Skills', icon: '🛠️' },
        { id: 'languages', label: 'Languages', icon: '🌍' },
        { id: 'projects', label: 'Projects', icon: '🚀' },
        { id: 'certifications', label: 'Certifications', icon: '🏆' },
        { id: 'volunteer', label: 'Volunteer Experience', icon: '❤️' },
        { id: 'template', label: 'Template Selection', icon: '🎨' }
      ];
    } else {
      return [
        { id: 'personal', label: 'Şəxsi Məlumatlar', icon: '👤' },
        { id: 'experience', label: 'İş Təcrübəsi', icon: '💼' },
        { id: 'education', label: 'Təhsil', icon: '🎓' },
        { id: 'skills', label: 'Bacarıqlar', icon: '🛠️' },
        { id: 'languages', label: 'Dillər', icon: '🌍' },
        { id: 'projects', label: 'Layihələr', icon: '🚀' },
        { id: 'certifications', label: 'Sertifikatlar', icon: '🏆' },
        { id: 'volunteer', label: 'Könüllü Təcrübə', icon: '❤️' },
        { id: 'template', label: 'Şablon Seçimi', icon: '🎨' }
      ];
    }
  };

  const sections = getSections(cv.data.cvLanguage || 'azerbaijani');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">CV yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Geri</span>
              </button>
              <input
                type="text"
                placeholder="CV başlığı..."
                value={cv.title}
                onChange={(e) => setCv(prev => ({ ...prev, title: e.target.value }))}
                className="w-full sm:w-64 text-lg font-semibold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 focus:bg-white transition-colors"
              />
              
              {/* AI Translation Button */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <button
                  onClick={() => setShowTranslationDialog(true)}
                  disabled={translating || !cv.id}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    !cv.id || translating
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {translating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      <span>Tərcümə...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <span>AI Tərcümə</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={!cv.id || exporting !== null}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !cv.id || exporting !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {exporting === 'pdf' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 2v4h8V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z"/>
                </svg>
                )}
                PDF
              </button>

              <button
                onClick={() => handleExport('docx')}
                disabled={!cv.id || exporting !== null}
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !cv.id || exporting !== null
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {exporting === 'docx' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                )}
                DOCX
              </button>

              {/* SAVE BUTTON - ƏN VACIB! */}
              <button
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  saving
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Saxlanılır...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>CV-ni Saxla</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Left Panel - Form */}
          <div className="flex-1 xl:max-w-xl">
            {/* Mobile Section Selector */}
            <div className="xl:hidden mb-5 relative z-40">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-40"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.icon} {section.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Section Navigation */}
            <div className="hidden xl:block mb-5">
              <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5">
                <div className="grid grid-cols-2 gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{section.icon}</span>
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-5">
                {/* Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{success}</span>
                    </div>
                  </div>
                )}

                {/* LinkedIn Import Info */}
                {initialData && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-medium text-green-800 text-sm">LinkedIn məlumatları import edildi</span>
                    </div>
                    <p className="text-xs text-green-700">
                      Məlumatlar uğurla yükləndi və CV-yə əlavə edildi.
                    </p>
                  </div>
                )}
                
                {/* Dynamic Section Content */}
                <div className="space-y-4">
                  {activeSection === 'personal' && (
                    <PersonalInfoSection
                      data={{
                        fullName: cv.data.personalInfo.fullName,
                        firstName: cv.data.personalInfo.firstName,
                        lastName: cv.data.personalInfo.lastName,
                        email: cv.data.personalInfo.email,
                        phone: cv.data.personalInfo.phone,
                        website: cv.data.personalInfo.website,
                        linkedin: cv.data.personalInfo.linkedin,
                        summary: cv.data.personalInfo.summary,
                        profileImage: cv.data.personalInfo.profileImage
                      }}
                      userTier={userTier}
                      cvData={cv.data}
                      cvId={cv.id || cvId}
                      onChange={(data: any) => updateCVData('personalInfo', {
                        fullName: data.fullName,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: data.phone,
                        website: data.website,
                        linkedin: data.linkedin,
                        summary: data.summary,
                        profileImage: data.profileImage
                      })}
                    />
                  )}
                  {activeSection === 'experience' && (
                    <ExperienceSection
                      data={cv.data.experience || [] as any}
                      onChange={(data: CVData['data']['experience']) => updateCVData('experience', data)}
                    />
                  )}
                  {activeSection === 'education' && (
                    <EducationSection
                      data={cv.data.education || [] as any}
                      onChange={(data: CVData['data']['education']) => updateCVData('education', data)}
                    />
                  )}
                  {activeSection === 'skills' && (
                    <SkillsSection
                      data={cv.data.skills || [] as any}
                      onChange={(data: any) => updateCVData('skills', data)}
                      userTier={userTier}
                      cvData={cv.data}
                      cvId={cv.id || cvId}
                    />
                  )}
                  {activeSection === 'languages' && (
                    <LanguagesSection
                      data={cv.data.languages || [] as any}
                      onChange={(data: any) => updateCVData('languages', data)}
                    />
                  )}
                  {activeSection === 'projects' && (
                    <ProjectsSection
                      data={cv.data.projects || [] as any}
                      onChange={(data: any) => updateCVData('projects', data)}
                    />
                  )}
                  {activeSection === 'certifications' && (
                    <CertificationsSection
                      data={cv.data.certifications || [] as any}
                      onChange={(data: any) => updateCVData('certifications', data)}
                    />
                  )}
                  {activeSection === 'volunteer' && (
                    <VolunteerExperienceSection
                      data={cv.data.volunteerExperience || [] as any}
                      onChange={(data: any) => updateCVData('volunteerExperience', data)}
                    />
                  )}
                  {/* {activeSection === 'publications' && (
                    <PublicationsSection
                      data={cv.data.publications || []}
                      onChange={(data: any) => updateCVData('publications', data)}
                    />
                  )}
                  {activeSection === 'honors' && (
                    <HonorsAwardsSection
                      data={cv.data.honorsAwards || []}
                      onChange={(data: any) => updateCVData('honorsAwards', data)}
                    />
                  )}
                  {activeSection === 'testScores' && (
                    <TestScoresSection
                      data={cv.data.testScores || []}
                      onChange={(data: any) => updateCVData('testScores', data)}
                    />
                  )}
                  {activeSection === 'recommendations' && (
                    <RecommendationsSection
                      data={cv.data.recommendations || []}
                      onChange={(data: any) => updateCVData('recommendations', data)}
                    />
                  )}
                  {activeSection === 'courses' && (
                    <CoursesSection
                      data={cv.data.courses || []}
                      onChange={(data: any) => updateCVData('courses', data)}
                    />
                  )} */}
                  {activeSection === 'template' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Şablon Seçimi</h3>
                      <TemplateSelector
                        selectedTemplateId={cv.templateId}
                        onTemplateSelect={(templateId: string) => setCv(prev => ({ ...prev, templateId }))}
                        userTier={userTier}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Export Buttons */}
            <div className="sm:hidden mt-5 bg-white rounded-lg shadow-sm border border-gray-200 p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {exporting === 'pdf' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 2v4h8V2h2a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z"/>
                  </svg>
                  )}
                  PDF
                </button>
                
                <button
                  onClick={() => handleExport('docx')}
                  disabled={!cv.id || exporting !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    !cv.id || exporting !== null
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {exporting === 'docx' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  )}
                  DOCX
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 xl:max-w-5xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-5 py-3.5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-800">Canlı Önizləmə</h3>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                      A4 Format
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="hidden sm:inline text-xs">Canlı güncəllənir</span>
                  </div>
                </div>
              </div>
                
                <div className="bg-gray-50" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '95vh',
                  width: '100%',
                  padding: '25px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    {cv.templateId ? (
                      <div className="shadow-lg bg-white rounded-lg overflow-hidden" style={{ 
                        width: '794px', // Exact A4 width at 96 DPI
                        height: '95vh',
                        minHeight: '900px',
                        maxHeight: '1600px',
                        border: '1px solid #e5e7eb',
                        aspectRatio: '794/1123', // Real A4 aspect ratio
                        margin: '0 auto'
                      }}>
                        <div className={`w-full h-full ${styles.responsivePreview}`} style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#cbd5e1 #f1f5f9',
                          minHeight: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <CVPreviewA4 cv={{
                            ...cv,
                            data: {
                              ...cv.data,
                              personalInfo: {
                                ...cv.data.personalInfo,
                                name: cv.data.personalInfo.fullName
                              }
                            } as any
                          }} />
                        </div>
                      </div>
                    ) : (
                      <div className="shadow-lg bg-white rounded-lg flex items-center justify-center text-center" style={{ 
                        width: '794px', // Match A4 width
                        height: '95vh', // Match the preview height
                        minHeight: '900px',
                        maxHeight: '1600px',
                        border: '1px solid #e5e7eb',
                        margin: '0 auto'
                      }}>
                        <div>
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                            <path d="M14 2v6h6"/>
                          </svg>
                          <h3 className="text-lg font-medium mb-2 text-gray-600">Şablon Seçin</h3>
                          <p className="text-sm text-gray-500 mb-4">CV önizləməsini görmək üçün bir şablon seçin</p>
                          <button
                            onClick={() => setActiveSection('template')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Şablon Seç
                          </button>
                        </div>
                      </div>
                    )}
                  </div>              </div>
              
              {/* Export disclaimer */}
              {cv.id && (
                <div className="px-5 py-2.5 bg-yellow-50 border-t border-yellow-200">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 flex-shrink-0">💡</span>
                    <div className="text-xs text-yellow-800">
                      <strong>Qeyd:</strong> Önizləmə tam hazır olmaya bilər, ancaq export edilən faylda bütün məlumatlarınız düzgün görünəcək.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Translation Dialog */}
      {showTranslationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Professional Translation
                </h3>
                <p className="text-sm text-gray-600">
                  {canUseAIFeatures(userTier) ?
                    `${userTier} üzvü - Professional tərcümə xidməti` :
                    'Premium və Medium üzvlər üçün mövcuddur'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Tərcümə Xidməti</h4>
                <p className="text-sm text-blue-800">
                  AI sizin CV məzmununuzu professional olaraq tərcümə edəcək:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• Professional özət və iş təcrübələri</li>
                  <li>• Təhsil və layihə təsvirləri</li>
                  <li>• Sertifikat və könüllü təcrübələr</li>
                  <li>• İndustiya terminologiyası korunur</li>
                  <li>• Şirkət və təşkilat adları dəyişilmir</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAITranslation('azerbaijani')}
                  disabled={translating || !canUseAIFeatures(userTier)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    translating || !canUseAIFeatures(userTier)
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <div className="text-2xl mb-2">🇦🇿</div>
                  <div className="font-medium">Azərbaycan dilinə</div>
                  <div className="text-xs mt-1">Professional tərcümə</div>
                </button>

                <button
                  onClick={() => handleAITranslation('english')}
                  disabled={translating || !canUseAIFeatures(userTier)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    translating || !canUseAIFeatures(userTier)
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-green-200 bg-green-50 text-green-800 hover:border-green-300 hover:bg-green-100'
                  }`}
                >
                  <div className="text-2xl mb-2">🇺🇸</div>
                  <div className="font-medium">English Translation</div>
                  <div className="text-xs mt-1">Professional quality</div>
                </button>
              </div>

              {!canUseAIFeatures(userTier) && (
                <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-600 text-lg">💎</span>
                    <div>
                      <p className="text-sm font-medium text-purple-800 mb-1">
                        AI Professional Translation
                      </p>
                      <p className="text-xs text-purple-700">
                        CV məzmununuzu dərin analiz edərək professional tərcümə xidməti verir.
                        Premium və Medium planlar üçün mövcuddur.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowTranslationDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
