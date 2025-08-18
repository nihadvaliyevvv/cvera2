import { useState, useCallback, useEffect } from 'react';
import { useNotification } from '@/components/ui/Toast';
import TemplateSelector from './TemplateSelector';
import CVPreviewA4 from './CVPreviewA4';
import CVSectionManager from './CVSectionManager';
import CVPreviewA4Complex from './CVPreviewA4-complex';
import CVPreviewMedium from './CVPreviewMedium';
import FontManagementPanel from './FontManagementPanel';
import styles from './CVEditor.module.css';
import { CVData, PersonalInfo, Experience, Education, Skill, Language, Project, Certification, VolunteerExperience } from '@/types/cv';
import { CVTranslationPanel } from '../translation/CVTranslationPanel';
import { aiTranslateFullCV } from '@/lib/cvLanguage';

// Import section components
import PersonalInfoSection from './sections/PersonalInfoSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import VolunteerExperienceSection from './sections/VolunteerExperienceSection';
import CustomSectionsSection from './sections/CustomSectionsSection';

// API client for HTTP requests
const apiClient = {
    get: async (url: string) => {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },
    post: async (url: string, data: any) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },
    put: async (url: string, data: any) => {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },
};

// Type definitions for the CV editor
type CVLanguage = 'azerbaijani' | 'english';

interface CVDataType {
    personalInfo: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    projects: Project[];
    certifications: Certification[];
    volunteerExperience: VolunteerExperience[];
    publications: any[];
    honorsAwards: any[];
    testScores: any[];
    recommendations: any[];
    courses: any[];
    customSections?: any[];
    sectionOrder?: any[];
    cvLanguage: CVLanguage;
}

interface CVEditorData {
    id?: string;
    title: string;
    templateId: string;
    data: CVDataType;
}

interface CVEditorState {
    id?: string;
    title: string;
    templateId: string;
    createdAt?: string;
    personalInfo: PersonalInfo;
    experience?: Experience[];
    education?: Education[];
    skills?: Skill[];
    languages?: Language[];
    projects?: Project[];
    certifications?: Certification[];
    volunteerExperience?: VolunteerExperience[];
    publications?: any[];
    honorsAwards?: any[];
    testScores?: any[];
    recommendations?: any[];
    courses?: any[];
    customSections?: any[];
    sectionOrder?: any[];
    cvLanguage?: CVLanguage;
    translationMetadata?: {
        translatedAt: string;
        fromLanguage: string;
        toLanguage: string;
        translationLock: boolean;
        dataIntegrity?: string;
    };
    lastUpdated?: string;
    forceUpdateKey?: number;
}

interface CVEditorProps {
    cvId?: string;
    onSave: (cv: CVEditorData) => void;
    onCancel: () => void;
    initialData?: any;
    userTier?: string;
}

// Utility functions
const getDefaultCVLanguage = (): CVLanguage => 'azerbaijani';

const canUseAIFeatures = (tier: string | undefined): boolean => {
    return tier === 'Premium' || tier === 'Medium';
};

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
                    startDate: edu.college_duration?.split(' - ')[0]?.trim() || edu.start_date || edu.startDate ||
                        edu.starts_at || edu.from || edu.start_year || '',
                    endDate: edu.college_duration?.split(' - ')[1]?.trim() || edu.end_date || edu.endDate ||
                        edu.ends_at || edu.to || edu.end_year || edu.graduation_year || '',
                    current: edu.current || (edu.college_duration && edu.college_duration.includes('Present')) || false,
                    gpa: edu.gpa || '',
                    // description: edu.college_activity || edu.description || edu.activities ||
                    //             edu.notes || edu.details || ''
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

    const transformedData: CVDataType = {
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
        courses: [],
        cvLanguage: 'azerbaijani' as CVLanguage
    };

    console.log('🎉 CVEditor: Final transformed CV data:', transformedData);
    return transformedData;
};

export default function CVEditor({ cvId, onSave, onCancel, initialData, userTier = 'Premium' }: CVEditorProps) {
    // Add the useNotification hook
    const { showSuccess, showError, showWarning, showInfo } = useNotification();

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

    const [cv, setCv] = useState<CVEditorState>(() => {
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
                    id: undefined,
                    title: 'LinkedIn Import CV',
                    templateId: 'basic',
                    createdAt: new Date().toISOString(),
                    personalInfo: transformedData.personalInfo,
                    experience: transformedData.experience || [],
                    education: transformedData.education || [],
                    skills: transformedData.skills || [],
                    languages: transformedData.languages || [],
                    projects: transformedData.projects || [],
                    certifications: transformedData.certifications || [],
                    volunteerExperience: transformedData.volunteerExperience || [],
                    publications: transformedData.publications || [],
                    honorsAwards: transformedData.honorsAwards || [],
                    testScores: transformedData.testScores || [],
                    recommendations: transformedData.recommendations || [],
                    courses: transformedData.courses || [],
                    cvLanguage: transformedData.cvLanguage || getDefaultCVLanguage()
                };
            } else if (initialData.cv_data || initialData.data) {
                // This is existing CV data from database
                console.log('🔄 Processing existing CV data from database...');
                const cvData = initialData.cv_data || initialData.data;

                // Check if this CV was created from LinkedIn import
                if (cvData.source === 'linkedin_import') {
                    console.log('🔗 This CV was created from LinkedIn import, ensuring proper format...');

                    // Ensure LinkedIn import data is in correct format
                    const processedPersonalInfo = cvData.personalInfo || {
                        fullName: '',
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        website: '',
                        linkedin: '',
                        location: '',
                        summary: ''
                    };

                    return {
                        id: initialData.id,
                        title: initialData.title || 'LinkedIn Import CV',
                        templateId: initialData.templateId || 'basic',
                        createdAt: initialData.createdAt || new Date().toISOString(),
                        personalInfo: processedPersonalInfo,
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
                        languages: cvData.languages || [],
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
                } else {
                    // Regular existing CV data
                    return {
                        id: initialData.id,
                        title: initialData.title || '',
                        templateId: initialData.templateId || '',
                        createdAt: initialData.createdAt || new Date().toISOString(),
                        personalInfo: cvData.personalInfo || {
                            fullName: '',
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            website: '',
                            linkedin: '',
                            location: '',
                            summary: ''
                        },
                        experience: cvData.experience || [],
                        education: cvData.education || [],
                        skills: cvData.skills || [],
                        languages: cvData.languages || [],
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
                }
            }
        }

        // Default empty CV
        return {
            id: undefined,
            title: '',
            templateId: '',
            createdAt: new Date().toISOString(),
            personalInfo: {
                firstName: '',
                lastName: '',
                fullName: '',
                email: '',
                phone: '',
                website: '',
                linkedin: '',
                location: '',
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
    const [showSectionManager, setShowSectionManager] = useState(false);
    const [enablePreviewSelection, setEnablePreviewSelection] = useState(false);

    // Handle CV language change with translation option
    const handleLanguageChange = async (newLanguage: CVLanguage) => {
        const currentLanguage = cv.cvLanguage || 'azerbaijani';

        // If language is the same, no need to change
        if (currentLanguage === newLanguage) return;

        // Check if user has content to translate
        const hasContent = cv.personalInfo?.summary ||
            (cv.experience && cv.experience.length > 0) ||
            (cv.education && cv.education.length > 0);

        // If user has AI features and content, show translation dialog
        if (canUseAIFeatures(userTier) && hasContent) {
            setPendingLanguage(newLanguage);
            setShowTranslationDialog(true);
        } else {
            // Just change language without translation
            setCv(prevCv => ({
                ...prevCv,
                cvLanguage: newLanguage
            }));
        }
    };

    // Translate CV content to new language
    const handleTranslateContent = async () => {
        if (!pendingLanguage) return;

        setTranslating(true);
        setShowTranslationDialog(false);

        try {
            console.log('Starting translation to:', pendingLanguage);

            // Create translated content - now using flat CV structure
            const translatedData: CVData = {
                personalInfo: cv.personalInfo,
                experience: cv.experience,
                education: cv.education,
                skills: cv.skills,
                languages: cv.languages,
                projects: cv.projects,
                certifications: cv.certifications,
                volunteerExperience: cv.volunteerExperience,
                publications: cv.publications,
                honorsAwards: cv.honorsAwards,
                testScores: cv.testScores,
                recommendations: cv.recommendations,
                courses: cv.courses,
                cvLanguage: cv.cvLanguage
            };

            // Simple translation mapping for common fields
            const translations: Record<string, Record<string, string>> = {
                azerbaijani: {
                    'Software Engineer': 'Proqram Mühəndisi',
                    'Frontend Developer': 'Frontend Proqramçısı',
                    'Backend Developer': 'Backend Proqramçısı',
                    'Full Stack Developer': 'Full Stack Proqramçısı',
                    'Project Manager': 'Layihə Meneceri',
                    'Data Analyst': 'Məlumat Analitiki',
                    'UI/UX Designer': 'UI/UX Dizayner',
                    'Bachelor of Science': 'Bakalavr dərəcəsi',
                    'Master of Science': 'Magistr dərəcəsi',
                    'Computer Science': 'Kompüter Elmləri',
                    'Information Technology': 'İnformasiya Texnologiyaları',
                    'Business Administration': 'Biznes İdarəetməsi',
                    'Present': 'Hazırda',
                    'Current': 'Hazırda',
                    'JavaScript': 'JavaScript',
                    'Python': 'Python',
                    'React': 'React',
                    'Node.js': 'Node.js',
                    'HTML/CSS': 'HTML/CSS',
                    'English': 'İngilis dili',
                    'Native': 'Ana dili',
                    'Fluent': 'Səlis',
                    'Advanced': 'Yüksək səviyyə',
                    'Intermediate': 'Orta səviyyə',
                    'Beginner': 'Başlanğıc səviyyə'
                },
                english: {
                    'Proqram Mühəndisi': 'Software Engineer',
                    'Frontend Proqramçısı': 'Frontend Developer',
                    'Backend Proqramçısı': 'Backend Developer',
                    'Full Stack Proqramçısı': 'Full Stack Developer',
                    'Layihə Meneceri': 'Project Manager',
                    'Məlumat Analitiki': 'Data Analyst',
                    'UI/UX Dizayner': 'UI/UX Designer',
                    'Bakalavr dərəcəsi': 'Bachelor of Science',
                    'Magistr dərəcəsi': 'Master of Science',
                    'Kompüter Elmləri': 'Computer Science',
                    'İnformasiya Texnologiyaları': 'Information Technology',
                    'Biznes İdarəetməsi': 'Business Administration',
                    'Hazırda': 'Present',
                    'İngilis dili': 'English',
                    'Ana dili': 'Native',
                    'Səlis': 'Fluent',
                    'Yüksək səviyyə': 'Advanced',
                    'Orta səviyyə': 'Intermediate',
                    'Başlanğıc səviyyə': 'Beginner'
                }
            };

            const translateText = (text: string, targetLanguage: string): string => {
                if (!text) return text;
                const translationMap: Record<string, string> = translations[targetLanguage] || {};

                // Check for exact matches first
                if (translationMap[text]) {
                    return translationMap[text];
                }

                // Check for partial matches and replace
                let translatedText = text;
                Object.keys(translationMap).forEach(key => {
                    const regex = new RegExp(key, 'gi');
                    translatedText = translatedText.replace(regex, translationMap[key]);
                });

                return translatedText;
            };

            // Translate personal info
            if (translatedData.personalInfo) {
                translatedData.personalInfo.summary = translateText(
                    translatedData.personalInfo.summary || '',
                    pendingLanguage
                );
            }

            // Translate experience
            if (translatedData.experience) {
                translatedData.experience = translatedData.experience.map(exp => ({
                    ...exp,
                    position: translateText(exp.position || '', pendingLanguage),
                    description: translateText(exp.description || '', pendingLanguage)
                }));
            }

            // Translate education
            if (translatedData.education) {
                translatedData.education = translatedData.education.map(edu => ({
                    ...edu,
                    degree: translateText(edu.degree || '', pendingLanguage)
                }));
            }

            // Translate skills
            if (translatedData.skills) {
                translatedData.skills = translatedData.skills.map(skill => ({
                    ...skill,
                    name: translateText(skill.name || '', pendingLanguage)
                }));
            }

            // Translate languages
            if (translatedData.languages) {
                translatedData.languages = translatedData.languages.map(lang => ({
                    ...lang,
                    language: translateText(lang.language || '', pendingLanguage),
                    level: translateText(lang.level || '', pendingLanguage)
                }));
            }

            // Translate projects
            if (translatedData.projects) {
                translatedData.projects = translatedData.projects.map(project => ({
                    ...project,
                    name: translateText(project.name || '', pendingLanguage),
                    description: translateText(project.description || '', pendingLanguage),
                    technologies: Array.isArray(project.technologies)
                        ? project.technologies.map(tech => translateText(tech, pendingLanguage))
                        : project.technologies
                }));
            }

            // Translate certifications
            if (translatedData.certifications) {
                translatedData.certifications = translatedData.certifications.map(cert => ({
                    ...cert,
                    name: translateText(cert.name || '', pendingLanguage),
                    issuer: translateText(cert.issuer || '', pendingLanguage),
                    description: translateText(cert.description || '', pendingLanguage)
                }));
            }

            // Set the new language and add translation metadata
            translatedData.cvLanguage = pendingLanguage;
            translatedData.translationMetadata = {
                translatedAt: new Date().toISOString(),
                fromLanguage: cv.cvLanguage,
                toLanguage: pendingLanguage,
                translationLock: true
            };

            // Update CV state with translated content - FIXED TYPE STRUCTURE
            const updatedCV: CVEditorState = {
                ...cv,
                cvLanguage: pendingLanguage,
                // Properly merge personalInfo
                personalInfo: translatedData.personalInfo ? { ...cv.personalInfo, ...translatedData.personalInfo } : cv.personalInfo,
                // Update arrays with translated content
                experience: translatedData.experience ? [...translatedData.experience] : cv.experience || [],
                education: translatedData.education ? [...translatedData.education] : cv.education || [],
                skills: translatedData.skills ? [...translatedData.skills] : cv.skills || [],
                languages: translatedData.languages ? [...translatedData.languages] : cv.languages || [],
                projects: translatedData.projects ? [...translatedData.projects] : cv.projects || [],
                certifications: translatedData.certifications ? [...translatedData.certifications] : cv.certifications || [],
                // Preserve other CV editor state properties
                volunteerExperience: cv.volunteerExperience || [],
                publications: cv.publications || [],
                honorsAwards: cv.honorsAwards || [],
                testScores: cv.testScores || [],
                recommendations: cv.recommendations || [],
                courses: cv.courses || [],
                customSections: cv.customSections || [],
                sectionOrder: cv.sectionOrder || [],
                // Add translation metadata
                translationMetadata: {
                    translatedAt: new Date().toISOString(),
                    fromLanguage: cv.cvLanguage || 'azerbaijani',
                    toLanguage: pendingLanguage,
                    translationLock: true
                }
            };

            console.log('🔄 CV state yenilənir:', updatedCV);

            // Force re-render by updating state immediately
            setCv(updatedCV);

            // Force a complete re-render by updating the component key
            const forceUpdate = Date.now();

            // Show success message
            showSuccess(`CV uğurla ${pendingLanguage === 'azerbaijani' ? 'Azərbaycan' : 'İngilis'} dilinə tərcümə edildi!`);

            // Additional immediate refresh to ensure UI updates
            setTimeout(() => {
                console.log('🔄 Forcing immediate UI refresh...');
                setCv(prev => ({
                    ...prev,
                    lastUpdated: new Date().toISOString(),
                    forceUpdateKey: forceUpdate
                }));
            }, 100);

            // Auto-save the translated CV with improved timing and error handling
            const saveTranslatedCV = async () => {
                try {
                    console.log('💾 Tərcümə olunan CV saxlanılır...');

                    // CRITICAL FIX: Use the translated CV data directly instead of current state
                    // This prevents reverting to old data during save
                    const translatedCVForSave = {
                        id: cv.id || cvId,
                        title: cv.title || 'Untitled CV',
                        templateId: cv.templateId || 'basic',
                        data: {
                            personalInfo: updatedCV.personalInfo,
                            experience: updatedCV.experience || [],
                            education: updatedCV.education || [],
                            skills: updatedCV.skills || [],
                            languages: updatedCV.languages || [],
                            projects: updatedCV.projects || [],
                            certifications: updatedCV.certifications || [],
                            volunteerExperience: updatedCV.volunteerExperience || [],
                            publications: updatedCV.publications || [],
                            honorsAwards: updatedCV.honorsAwards || [],
                            testScores: updatedCV.testScores || [],
                            recommendations: updatedCV.recommendations || [],
                            courses: updatedCV.courses || [],
                            customSections: updatedCV.customSections || [],
                            sectionOrder: updatedCV.sectionOrder || [],
                            cvLanguage: pendingLanguage as CVLanguage, // Ensure proper type assertion
                            translationMetadata: updatedCV.translationMetadata
                        }
                    };

                    console.log('🎯 Tərcümə edilmiş CV saxlanır:', translatedCVForSave);

                    // FIXED: Save directly using API client instead of onSave callback to prevent navigation
                    const saveResult = await apiClient.put(`/api/cv/${cv.id}`, {
                        title: translatedCVForSave.title,
                        cv_data: translatedCVForSave.data
                    });

                    console.log('✅ Tərcümə olunan CV uğurla saxlanıldı');

                    // CRITICAL: Prevent any data reload after save
                    // Update state again to ensure consistency
                    setCv(updatedCV);

                    // Show additional success message for translation completion
                    showSuccess('Tərcümə tamamlandı və CV saxlanıldı! Səhifədə qalırsınız.');

                } catch (saveError) {
                    console.error('❌ Tərcümə olunan CV saxlanılarkən xəta:', saveError);
                    showWarning('Tərcümə uğurlu oldu, lakin saxlanılarkən xəta yarandı. Yenidən saxlamağı cəhd edin.');

                    // Even if save fails, keep the translated data in state
                    setCv(updatedCV);
                }
            };

            // Execute save immediately to prevent state conflicts
            await saveTranslatedCV();
        } catch (error) {
            console.error('Translation error:', error);
            setError('Translation failed. Language changed without content translation.');
            // Still change the language even if translation fails
            setCv(prevCv => ({
                ...prevCv,
                cvLanguage: pendingLanguage
            }));
        } finally {
            setTranslating(false);
            setPendingLanguage(null);
        }
    };

    // Skip translation and just change language
    const handleSkipTranslation = async () => {
        if (!pendingLanguage) return;

        const updatedCV = {
            ...cv,
            cvLanguage: pendingLanguage
        };

        setCv(updatedCV);

        // Save the language change to database immediately
        if (cvId) {
            try {
                const sanitizedData = {
                    personalInfo: cv.personalInfo,
                    experience: Array.isArray(cv.experience) ? cv.experience : [],
                    education: Array.isArray(cv.education) ? cv.education : [],
                    skills: Array.isArray(cv.skills) ? cv.skills : [],
                    languages: Array.isArray(cv.languages) ? cv.languages : [],
                    projects: Array.isArray(cv.projects) ? cv.projects : [],
                    certifications: Array.isArray(cv.certifications) ? cv.certifications : [],
                    volunteerExperience: Array.isArray(cv.volunteerExperience) ? cv.volunteerExperience : [],
                    publications: Array.isArray(cv.publications) ? cv.publications : [],
                    honorsAwards: Array.isArray(cv.honorsAwards) ? cv.honorsAwards : [],
                    testScores: Array.isArray(cv.testScores) ? cv.testScores : [],
                    recommendations: Array.isArray(cv.recommendations) ? cv.recommendations : [],
                    courses: Array.isArray(cv.courses) ? cv.courses : [],
                    sectionOrder: cv.sectionOrder || [],
                    cvLanguage: pendingLanguage
                };

                const apiData = {
                    title: cv.title,
                    cv_data: sanitizedData
                };

                await apiClient.put(`/api/cv/${cvId}`, apiData);
                console.log('✅ Language change saved to database');
            } catch (error) {
                console.error('❌ Failed to save language change:', error);
                setError('Dil dəyişikliyi saxlanmadı. Yenidən cəhd edin.');
            }
        }

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

            const templateId = cvData.templateId || 'basic'; // "professional" deyil, "basic"

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
                    languages: Array.isArray(actualCVData.languages) ? actualCVData.languages.map((lang: any) => ({
                        id: lang.id || `lang-loaded-${Date.now()}-${Math.random()}`,
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
                    customSections: Array.isArray(actualCVData.customSections) ? actualCVData.customSections : [],
                    sectionOrder: Array.isArray(actualCVData.sectionOrder) ? actualCVData.sectionOrder : [],
                    cvLanguage: actualCVData.cvLanguage || getDefaultCVLanguage()
                };

                console.log('✅ CVEditor: LinkedIn CV transformed for editing:', {
                    personalInfo: transformedCV.personalInfo.fullName,
                    experienceCount: transformedCV.experience.length,
                    educationCount: transformedCV.education.length,
                    skillsCount: transformedCV.skills.length,
                    languagesCount: transformedCV.languages.length
                });

                setCv(transformedCV);
            } else {
                // Regular CV data processing
                console.log('📄 CVEditor: Processing regular CV data...');

                const transformedCV = {
                    id: cvData.id,
                    title: cvData.title || 'Untitled CV',
                    templateId: templateId,
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
                    customSections: Array.isArray(actualCVData.customSections) ? actualCVData.customSections : [],
                    sectionOrder: Array.isArray(actualCVData.sectionOrder) ? actualCVData.sectionOrder : [],
                    cvLanguage: actualCVData.cvLanguage || getDefaultCVLanguage()
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
                personalInfo: transformedData.personalInfo,
                experience: transformedData.experience || [],
                education: transformedData.education || [],
                skills: transformedData.skills || [],
                languages: transformedData.languages || [],
                projects: transformedData.projects || [],
                certifications: transformedData.certifications || [],
                volunteerExperience: transformedData.volunteerExperience || [],
                publications: transformedData.publications || [],
                honorsAwards: transformedData.honorsAwards || [],
                testScores: transformedData.testScores || [],
                recommendations: transformedData.recommendations || [],
                courses: transformedData.courses || [],
                cvLanguage: transformedData.cvLanguage || getDefaultCVLanguage()
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

        if (!cv.personalInfo || !cv.personalInfo.fullName || cv.personalInfo.fullName.trim().length === 0) {
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
            // FIXED: Access properties directly from cv object (not cv.data)
            const sanitizedData = {
                personalInfo: cv.personalInfo,
                experience: Array.isArray(cv.experience) ? cv.experience : [],
                education: Array.isArray(cv.education) ? cv.education : [],
                skills: Array.isArray(cv.skills) ? cv.skills : [],
                languages: Array.isArray(cv.languages) ? cv.languages : [],
                projects: Array.isArray(cv.projects) ? cv.projects : [],
                certifications: Array.isArray(cv.certifications) ? cv.certifications : [],
                volunteerExperience: Array.isArray(cv.volunteerExperience) ? cv.volunteerExperience : [],
                publications: Array.isArray(cv.publications) ? cv.publications : [],
                honorsAwards: Array.isArray(cv.honorsAwards) ? cv.honorsAwards : [],
                testScores: Array.isArray(cv.testScores) ? cv.testScores : [],
                recommendations: Array.isArray(cv.recommendations) ? cv.recommendations : [],
                courses: Array.isArray(cv.courses) ? cv.courses : [],
                sectionOrder: cv.sectionOrder || [],
                cvLanguage: cv.cvLanguage || getDefaultCVLanguage(),
                // PRESERVE ALL TRANSLATION METADATA AND LOCKS if they exist
                translationMetadata: cv.translationMetadata || null,
                customSections: cv.customSections || []
            };

            // FIXED: Include templateId in the API request
            const apiData = {
                title: cv.title,
                cv_data: sanitizedData,
                templateId: cv.templateId // This was missing before!
            };

            console.log('💾 Saving CV with template:', cv.templateId);

            let result;
            if (cvId) {
                result = await apiClient.put(`/api/cv/${cvId}`, apiData);
                setSuccess('CV uğurla yeniləndi!');
            } else {
                result = await apiClient.post('/api/cv', apiData);
                setSuccess('CV uğurla yaradıldı!');
            }

            console.log('💾 Save API response:', result);

            // IMMEDIATE TRANSLATION LOCK CHECK - No setTimeout to prevent override
            const hasTranslationLock = cv.translationMetadata?.translationLock === true;
            const isTranslatedContent = cv.translationMetadata?.translatedAt;

            if (hasTranslationLock && isTranslatedContent) {
                console.log('🔒 TRANSLATION LOCK DETECTED - PRESERVING TRANSLATED CONTENT IMMEDIATELY');
                console.log('Translation metadata:', cv.translationMetadata);

                // Only update the CV ID if it's a new CV, preserve everything else
                if (!cvId && result?.data?.cv?.id) {
                    setCv(prev => ({
                        ...prev,
                        id: result.data.cv.id
                    }));

                    // Update URL for new CV
                    if (typeof window !== 'undefined') {
                        const newUrl = `/cv/edit/${result.data.cv.id}`;
                        window.history.replaceState({}, '', newUrl);
                        console.log('📝 Updated URL for new CV:', newUrl);
                    }
                } else if (!cvId && result?.data?.id) {
                    setCv(prev => ({
                        ...prev,
                        id: result.data.id
                    }));

                    if (typeof window !== 'undefined') {
                        const newUrl = `/cv/edit/${result.data.id}`;
                        window.history.replaceState({}, '', newUrl);
                        console.log('📝 Updated URL for new CV:', newUrl);
                    }
                }

                // CRITICAL: Do not reload or update CV data - keep translated content
                console.log('🛡️ Translation preserved - CV data unchanged in memory');

                // Show success message and exit early
                setSuccess(cv.cvLanguage === 'english' ?
                    'CV successfully saved with English translation!' :
                    'CV tərcümə ilə birlikdə uğurla saxlanıldı!'
                );
                return; // Exit early to prevent any CV data updates
            }

            // No translation lock - safe to update with server data as before
            console.log('✅ No translation lock - updating CV data from server');

            // Handle different API response structures safely
            let cvForSave: CVEditorState;
            if (result?.data?.cv) {
                const serverCvData = result.data.cv.cv_data || {};
                cvForSave = {
                    id: result.data.cv.id,
                    title: result.data.cv.title,
                    templateId: cv.templateId, // Preserve current template selection
                    personalInfo: serverCvData.personalInfo || cv.personalInfo,
                    experience: serverCvData.experience || cv.experience,
                    education: serverCvData.education || cv.education,
                    skills: serverCvData.skills || cv.skills,
                    languages: serverCvData.languages || cv.languages,
                    projects: serverCvData.projects || cv.projects,
                    certifications: serverCvData.certifications || cv.certifications,
                    volunteerExperience: serverCvData.volunteerExperience || cv.volunteerExperience,
                    publications: serverCvData.publications || cv.publications,
                    honorsAwards: serverCvData.honorsAwards || cv.honorsAwards,
                    testScores: serverCvData.testScores || cv.testScores,
                    recommendations: serverCvData.recommendations || cv.recommendations,
                    courses: serverCvData.courses || cv.courses,
                    customSections: serverCvData.customSections || cv.customSections,
                    sectionOrder: serverCvData.sectionOrder || cv.sectionOrder,
                    cvLanguage: serverCvData.cvLanguage || cv.cvLanguage,
                    translationMetadata: serverCvData.translationMetadata || cv.translationMetadata
                };
            } else if (result?.data?.id) {
                const serverCvData = result.data.cv_data || {};
                cvForSave = {
                    id: result.data.id,
                    title: result.data.title || cv.title,
                    templateId: cv.templateId, // Preserve current template selection
                    personalInfo: serverCvData.personalInfo || cv.personalInfo,
                    experience: serverCvData.experience || cv.experience,
                    education: serverCvData.education || cv.education,
                    skills: serverCvData.skills || cv.skills,
                    languages: serverCvData.languages || cv.languages,
                    projects: serverCvData.projects || cv.projects,
                    certifications: serverCvData.certifications || cv.certifications,
                    volunteerExperience: serverCvData.volunteerExperience || cv.volunteerExperience,
                    publications: serverCvData.publications || cv.publications,
                    honorsAwards: serverCvData.honorsAwards || cv.honorsAwards,
                    testScores: serverCvData.testScores || cv.testScores,
                    recommendations: serverCvData.recommendations || cv.recommendations,
                    courses: serverCvData.courses || cv.courses,
                    customSections: serverCvData.customSections || cv.customSections,
                    sectionOrder: serverCvData.sectionOrder || cv.sectionOrder,
                    cvLanguage: serverCvData.cvLanguage || cv.cvLanguage,
                    translationMetadata: serverCvData.translationMetadata || cv.translationMetadata
                };
            } else if (result?.id) {
                const serverCvData = result.cv_data || {};
                cvForSave = {
                    id: result.id,
                    title: result.title || cv.title,
                    templateId: cv.templateId, // Preserve current template selection
                    personalInfo: serverCvData.personalInfo || cv.personalInfo,
                    experience: serverCvData.experience || cv.experience,
                    education: serverCvData.education || cv.education,
                    skills: serverCvData.skills || cv.skills,
                    languages: serverCvData.languages || cv.languages,
                    projects: serverCvData.projects || cv.projects,
                    certifications: serverCvData.certifications || cv.certifications,
                    volunteerExperience: serverCvData.volunteerExperience || cv.volunteerExperience,
                    publications: serverCvData.publications || cv.publications,
                    honorsAwards: serverCvData.honorsAwards || cv.honorsAwards,
                    testScores: serverCvData.testScores || cv.testScores,
                    recommendations: serverCvData.recommendations || cv.recommendations,
                    courses: serverCvData.courses || cv.courses,
                    customSections: serverCvData.customSections || cv.customSections,
                    sectionOrder: serverCvData.sectionOrder || cv.sectionOrder,
                    cvLanguage: serverCvData.cvLanguage || cv.cvLanguage,
                    translationMetadata: serverCvData.translationMetadata || cv.translationMetadata
                };
            } else {
                cvForSave = {
                    id: cvId || cv.id || `cv-${Date.now()}`,
                    title: cv.title,
                    templateId: cv.templateId, // Keep current template selection
                    personalInfo: cv.personalInfo,
                    experience: cv.experience,
                    education: cv.education,
                    skills: cv.skills,
                    languages: cv.languages,
                    projects: cv.projects,
                    certifications: cv.certifications,
                    volunteerExperience: cv.volunteerExperience,
                    publications: cv.publications,
                    honorsAwards: cv.honorsAwards,
                    testScores: cv.testScores,
                    recommendations: cv.recommendations,
                    courses: cv.courses,
                    customSections: cv.customSections,
                    sectionOrder: cv.sectionOrder,
                    cvLanguage: cv.cvLanguage,
                    translationMetadata: cv.translationMetadata
                };
            }

            console.log('✅ Template preserved after save:', cvForSave.templateId);
            setCv(cvForSave);

            // Update URL for new CV
            if (!cvId && cvForSave.id && typeof window !== 'undefined') {
                const newUrl = `/cv/edit/${cvForSave.id}`;
                window.history.replaceState({}, '', newUrl);
                console.log('📝 Updated URL for new CV:', newUrl);
            }
        } catch (err) {
            console.error('CV save error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`CV saxlanarkən xəta baş verdi: ${errorMessage}`);
            showError(`CV saxlanarkən xəta baş verdi: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const updateCVData = (section: keyof CVEditorState, data: any) => {
        setCv(prev => ({
            ...prev,
            [section]: data
        }));
    };

    // Handle section order changes
    const handleSectionOrderChange = async (sections: any[]) => {
        console.log('🔄 Section order changed, auto-saving...', sections.map(s => ({ id: s.id, order: s.order })));

        // Update local state immediately to prevent UI revert
        setCv(prev => ({
            ...prev,
            sectionOrder: sections
        }));

        // AUTO-SAVE immediately to prevent data loss on drag & drop
        if (cv.id) {
            try {
                // Prepare the data in the correct format that the API expects
                const updatedCVData = {
                    ...cv,
                    sectionOrder: sections
                };

                const apiData = {
                    title: cv.title,
                    cv_data: updatedCVData
                };

                // Use the same API client and endpoint as the regular save function
                const result = await apiClient.put(`/api/cv/${cv.id}`, apiData);

                // Improved error handling - check response properly
                if (result) {
                    console.log('✅ Section order auto-saved successfully', result);

                    // Always update section order locally regardless of server response structure
                    setCv(prev => ({
                        ...prev,
                        sectionOrder: sections // Update section order immediately
                    }));

                    // Check if CV has translation locks and preserve them
                    const hasTranslationLock = cv.translationMetadata?.translationLock;

                    if (hasTranslationLock) {
                        console.log('🔒 Translation lock detected - preserving current CV data');
                        // Translation lock is active, keep current data structure
                    } else if (result.data?.cv?.cv_data) {
                        // No translation lock and server returned data - update with server data
                        setCv(prev => ({
                            ...prev,
                            ...result.data.cv.cv_data,
                            sectionOrder: sections // Ensure section order is preserved
                        }));
                    }

                    setSuccess('Bölmə sırası avtomatik saxlanıldı');
                    setTimeout(() => setSuccess(''), 2000);
                } else {
                    // Fallback - still update locally even if server didn't respond properly
                    console.warn('⚠️ Server response was empty, but updating locally');
                    setCv(prev => ({
                        ...prev,
                        sectionOrder: sections
                    }));

                    // Save to localStorage as backup
                    localStorage.setItem(`cv_section_order_${cv.id}`, JSON.stringify(sections));

                    setSuccess('Bölmə sırası lokal saxlanıldı');
                    setTimeout(() => setSuccess(''), 2000);
                }
            } catch (error) {
                console.error('❌ Auto-save failed:', error);
                setError('Avtomatik saxlama xətası. Yenidən cəhd edin.');
                setTimeout(() => setError(''), 3000);

                // Revert local state if save failed
                setCv(prev => ({
                    ...prev,
                    sectionOrder: prev.sectionOrder || []
                }));
            }
        }
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
            showWarning('AI tərcümə üçün CV-ni əvvəlcə saxlamalısınız');
            return;
        }

        const canUseAI = userTier === 'Premium' || userTier === 'Medium';
        if (!canUseAI) {
            showWarning(`AI tərcümə funksiyası Premium və Medium istifadəçilər üçün mövcuddur! Sizin tier: ${userTier}`);
            return;
        }

        setTranslating(true);
        setError('');
        setSuccess('');

        try {
            // Get authentication token
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('auth-token');

            if (!token) {
                showError('Giriş icazəsi yoxdur. Yenidən giriş edin.');
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
                    showError('Giriş icazəsi yoxdur. Yenidən giriş edin.');
                } else if (response.status === 403) {
                    showError(result.error || 'AI tərcümə üçün Premium/Medium planı lazımdır');
                } else if (response.status === 429) {
                    showError('Çox sayda sorğu göndərildi. Bir neçə dəqiqə sonra yenidən cəhd edin.');
                } else if (response.status >= 500) {
                    showError('Server xətası. Tərcümə xidməti müvəqqəti olaraq əlçatan deyil.');
                } else {
                    // More detailed error handling for other status codes
                    const errorMessage = result.error || `API xətası: ${response.status} - ${response.statusText}`;
                    showError(`Tərcümə xətası: ${errorMessage}`);
                }
                return;
            }

            // Check if the response has the expected structure
            if (result.success && result.translatedData) {
                console.log('🌐 Tərcümə məlumatları alındı:', result.translatedData);

                // Function to clean unwanted AI translation messages - ENHANCED VERSION
                const cleanTranslatedText = (text: string): string => {
                    if (!text || typeof text !== 'string') return text;

                    // Comprehensive list of unwanted AI translation messages to remove
                    const unwantedPatterns = [
                        // English patterns
                        /This section requires additional information to provide a complete translation\.?\s*/gi,
                        /This section needs more information for complete translation\.?\s*/gi,
                        /Additional information required for complete translation\.?\s*/gi,
                        /More information needed for translation\.?\s*/gi,
                        /Incomplete translation due to missing information\.?\s*/gi,
                        /Translation incomplete\.?\s*/gi,
                        /Cannot provide complete translation\.?\s*/gi,
                        /Unable to translate completely\.?\s*/gi,
                        /Partial translation only\.?\s*/gi,
                        /Translation not complete\.?\s*/gi,

                        // Azerbaijani patterns
                        /Bu bölmə tam tərcümə üçün əlavə məlumat tələb edir\.?\s*/gi,
                        /Tam tərcümə üçün əlavə məlumat lazımdır\.?\s*/gi,
                        /Tərcümə tam deyil\.?\s*/gi,
                        /Əlavə məlumat tələb olunur\.?\s*/gi,
                        /Tərcümə tamamlanmadı\.?\s*/gi,
                        /Natamam tərcümə\.?\s*/gi,

                        // Generic AI service messages
                        /I cannot translate this section completely\.?\s*/gi,
                        /Translation service error\.?\s*/gi,
                        /Error in translation\.?\s*/gi,
                        /Translation failed\.?\s*/gi,
                        /No translation available\.?\s*/gi,

                        // Remove empty brackets and parentheses left behind
                        /\[\s*\]/g,
                        /\(\s*\)/g,
                        /\{\s*\}/g
                    ];

                    let cleanedText = text;

                    // Apply all patterns except whitespace pattern
                    unwantedPatterns.forEach(pattern => {
                        cleanedText = cleanedText.replace(pattern, '');
                    });

                    // Handle multiple spaces separately
                    cleanedText = cleanedText.replace(/\s{2,}/g, ' ');

                    return cleanedText.trim();
                };

                // Clean all text fields in the translated data
                const cleanTranslatedData = (data: any): any => {
                    if (!data) return data;

                    if (typeof data === 'string') {
                        return cleanTranslatedText(data);
                    }

                    if ( Array.isArray(data)) {
                        return data.map(item => cleanTranslatedData(item));
                    }

                    if (typeof data === 'object') {
                        const cleaned: any = {};
                        for (const [key, value] of Object.entries(data)) {
                            cleaned[key] = cleanTranslatedData(value);
                        }
                        return cleaned;
                    }

                    return data;
                };

                // Apply cleaning to the translated data
                const cleanedTranslatedData = cleanTranslatedData(result.translatedData);

                // Validate that translatedData contains the expected fields
                const hasValidData = cleanedTranslatedData.personalInfo ||
                                   cleanedTranslatedData.experience ||
                                   cleanedTranslatedData.education ||
                                   cleanedTranslatedData.skills;

                if (!hasValidData) {
                    showWarning('Tərcümə tamamlandı, lakin bəzi məlumatlar eksik ola bilər.');
                }

                // IMPROVED: Deep merge translated data properly with better validation
                const updatedCV: CVEditorState = {
                    ...cv,
                    // Merge personalInfo properly
                    personalInfo: {
                        ...cv.personalInfo,
                        ...(cleanedTranslatedData.personalInfo || {})
                    },
                    // Update arrays with translated content, preserving original if translation is empty
                    experience: Array.isArray(cleanedTranslatedData.experience) && cleanedTranslatedData.experience.length > 0
                        ? cleanedTranslatedData.experience
                        : cv.experience || [],
                    education: Array.isArray(cleanedTranslatedData.education) && cleanedTranslatedData.education.length > 0
                        ? cleanedTranslatedData.education
                        : cv.education || [],
                    skills: Array.isArray(cleanedTranslatedData.skills) && cleanedTranslatedData.skills.length > 0
                        ? cleanedTranslatedData.skills
                        : cv.skills || [],
                    languages: Array.isArray(cleanedTranslatedData.languages) && cleanedTranslatedData.languages.length > 0
                        ? cleanedTranslatedData.languages
                        : cv.languages || [],
                    projects: Array.isArray(cleanedTranslatedData.projects) && cleanedTranslatedData.projects.length > 0
                        ? cleanedTranslatedData.projects
                        : cv.projects || [],
                    certifications: Array.isArray(cleanedTranslatedData.certifications) && cleanedTranslatedData.certifications.length > 0
                        ? cleanedTranslatedData.certifications
                        : cv.certifications || [],
                    volunteerExperience: Array.isArray(cleanedTranslatedData.volunteerExperience) && cleanedTranslatedData.volunteerExperience.length > 0
                        ? cleanedTranslatedData.volunteerExperience
                        : cv.volunteerExperience || [],
                    // Update language setting
                    cvLanguage: targetLanguage as CVLanguage,
                    // Preserve important fields
                    sectionOrder: cv.sectionOrder || [],
                    customSections: cv.customSections || [],
                    publications: cv.publications || [],
                    honorsAwards: cv.honorsAwards || [],
                    testScores: cv.testScores || [],
                    recommendations: cv.recommendations || [],
                    courses: cv.courses || [],
                    // Add translation metadata with proper typing
                    translationMetadata: {
                        translatedAt: new Date().toISOString(),
                        fromLanguage: cv.cvLanguage || 'azerbaijani',
                        toLanguage: targetLanguage,
                        translationLock: true,
                        dataIntegrity: hasValidData ? 'complete' : 'partial'
                    }
                };

                console.log('🔄 CV state yenilənir:', updatedCV);

                // Force re-render by updating state immediately
                setCv(updatedCV);

                // Force a complete re-render by updating the component key
                const forceUpdate = Date.now();

                // Show success message
                showSuccess(`CV uğurla ${targetLanguage === 'azerbaijani' ? 'Azərbaycan' : 'İngilis'} dilinə tərcümə edildi!`);

                // Additional immediate refresh to ensure UI updates
                setTimeout(() => {
                    console.log('🔄 Forcing immediate UI refresh...');
                    setCv(prev => ({
                        ...prev,
                        lastUpdated: new Date().toISOString(),
                        forceUpdateKey: forceUpdate
                    }));
                }, 100);

                // Auto-save the translated CV with improved timing and error handling
                const saveTranslatedCV = async () => {
                    try {
                        console.log('💾 Tərcümə olunan CV saxlanılır...');

                        // CRITICAL FIX: Use the translated CV data directly instead of current state
                        // This prevents reverting to old data during save
                        const translatedCVForSave = {
                            id: cv.id || cvId,
                            title: cv.title || 'Untitled CV',
                            templateId: cv.templateId || 'basic',
                            data: {
                                personalInfo: updatedCV.personalInfo,
                                experience: updatedCV.experience || [],
                                education: updatedCV.education || [],
                                skills: updatedCV.skills || [],
                                languages: updatedCV.languages || [],
                                projects: updatedCV.projects || [],
                                certifications: updatedCV.certifications || [],
                                volunteerExperience: updatedCV.volunteerExperience || [],
                                publications: updatedCV.publications || [],
                                honorsAwards: updatedCV.honorsAwards || [],
                                testScores: updatedCV.testScores || [],
                                recommendations: updatedCV.recommendations || [],
                                courses: updatedCV.courses || [],
                                customSections: updatedCV.customSections || [],
                                sectionOrder: updatedCV.sectionOrder || [],
                                cvLanguage: targetLanguage as CVLanguage, // Ensure proper type assertion
                                translationMetadata: updatedCV.translationMetadata
                            }
                        };

                        console.log('🎯 Tərcümə edilmiş CV saxlanır:', translatedCVForSave);

                        // FIXED: Save directly using API client instead of onSave callback to prevent navigation
                        const saveResult = await apiClient.put(`/api/cv/${cv.id}`, {
                            title: translatedCVForSave.title,
                            cv_data: translatedCVForSave.data
                        });

                        console.log('✅ Tərcümə olunan CV uğurla saxlanıldı');

                        // CRITICAL: Prevent any data reload after save
                        // Update state again to ensure consistency
                        setCv(updatedCV);

                        // Show additional success message for translation completion
                        showSuccess('Tərcümə tamamlandı və CV saxlanıldı! Səhifədə qalırsınız.');

                    } catch (saveError) {
                        console.error('❌ Tərcümə olunan CV saxlanılarkən xəta:', saveError);
                        showWarning('Tərcümə uğurlu oldu, lakin saxlanılarkən xəta yarandı. Yenidən saxlamağı cəhd edin.');

                        // Even if save fails, keep the translated data in state
                        setCv(updatedCV);
                    }
                };

                // Execute save immediately to prevent state conflicts
                await saveTranslatedCV();
            } else if (result.success === false) {
                // Handle specific error cases from the API
                if (result.error) {
                    if (result.error.includes('comprehensive')) {
                        showError('AI tərcümə xidməti şu anda əlçatan deyil. Daha sonra yenidən cəhd edin.');
                    } else if (result.error.includes('content')) {
                        showError('CV məzmunu tərcümə üçün uyğun deyil. Məzmunu yoxlayın və yenidən cəhd edin.');
                    } else if (result.error.includes('token') || result.error.includes('auth')) {
                        showError('Giriş icazəsi yoxdur. Yenidən giriş edin.');
                    } else {
                        showError(`Tərcümə xətası: ${result.error}`);
                    }
                } else {
                    showError('Bilinməyən tərcümə xətası. Yenidən cəhd edin.');
                }
            } else {
                // Fallback for unexpected response structure
                console.warn('Unexpected API response structure:', result);
                showError('Tərcümə cavabı gözlənilməyən formatdadır. Dəstək komandası ilə əlaqə saxlayın.');
            }

        } catch (error) {
            console.error('AI Translation error:', error);
            showError(error instanceof Error ? error.message : 'AI tərcümə zamanı xəta baş verdi');
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
                { id: 'customSections', label: 'Custom Sections', icon: '📝' },
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
                { id: 'customSections', label: 'Əlavə Bölmələr', icon: '📝' },
                { id: 'template', label: 'Şablon Seçimi', icon: '🎨' }
            ];
        }
    };

    const sections = getSections(cv.cvLanguage || 'azerbaijani');

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
            <div className="sticky top-0 z-[60] border-b border-gray-200 shadow-sm">
                <div className="bg-white">
                    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 gap-10">
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

                                {/* Font Management Panel */}
                                <FontManagementPanel
                                    cvId={cv.id || cvId}
                                    isPremium={userTier === 'Premium' || userTier === 'Medium'}
                                    onClose={() => console.log('Font settings applied')}
                                />

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
                                            <path d="M8 2v4h8V2h2a2 2 0 00-2 2v16a2 2 0 00-2-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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

                                {/* AI Translate Button */}
                                <button
                                    onClick={() => setShowTranslationDialog(true)}
                                    disabled={!cv.id || translating}
                                    className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        !cv.id || translating
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                                    title="AI ilə CV tərcümə et"
                                >
                                    {translating ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    )}
                                    {translating ? 'Tərcümə edilir...' : 'AI Tərcümə'}
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                        saving
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 00-2-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            <span>CV-ni Saxla</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex flex-col xl:flex-row gap-10 justify-center">

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
                                                fullName: cv.personalInfo.fullName,
                                                firstName: cv.personalInfo.firstName || '',
                                                lastName: cv.personalInfo.lastName || '',
                                                email: cv.personalInfo.email,
                                                phone: cv.personalInfo.phone,
                                                website: cv.personalInfo.website || '',
                                                linkedin: cv.personalInfo.linkedin || '',
                                                summary: cv.personalInfo.summary || '',
                                                profileImage: cv.personalInfo.profileImage || ''
                                            }}
                                            userTier={userTier}
                                            cvData={cv}
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
                                            data={cv.experience || [] as any}
                                            onChange={(data: any) => updateCVData('experience', data)}
                                        />
                                    )}
                                    {activeSection === 'education' && (
                                        <EducationSection
                                            data={cv.education || [] as any}
                                            onChange={(data: any) => updateCVData('education', data)}
                                        />
                                    )}
                                    {activeSection === 'skills' && (
                                        <SkillsSection
                                            data={cv.skills || [] as any}
                                            onChange={(data: any) => updateCVData('skills', data)}
                                            userTier={userTier}
                                            cvData={cv}
                                            cvId={cv.id || cvId}
                                        />
                                    )}
                                    {activeSection === 'languages' && (
                                        <LanguagesSection
                                            data={(cv.languages || []).map((lang: any) => ({
                                                id: lang.id || `lang-${Date.now()}-${Math.random()}`,
                                                language: lang.language || lang.name || '',
                                                level: lang.level || lang.proficiency || 'Professional'
                                            }))}
                                            onChange={(data: any) => {
                                                console.log('🔄 CVEditor: Languages changed from LanguagesSection:', data);

                                                // Store ALL languages during editing (including empty ones for UX)
                                                // But filter out completely empty languages when saving to CV
                                                const allLanguages = data.map((lang: any) => ({
                                                    id: lang.id || `lang-${Date.now()}-${Math.random()}`,
                                                    language: lang.language || '',
                                                    level: lang.level || 'Professional',
                                                    name: lang.language || '', // Compatibility field
                                                    proficiency: lang.level || 'Professional' // Compatibility field
                                                }));

                                                // Filter out only completely empty languages (no name AND no meaningful data)
                                                const validLanguages = allLanguages.filter((lang: any) =>
                                                    lang.language.trim() !== '' || lang.level !== 'Professional'
                                                );

                                                console.log('✅ CVEditor: All languages for editing:', allLanguages);
                                                console.log('✅ CVEditor: Valid languages for storage:', validLanguages);

                                                // Update CV data with valid languages only
                                                updateCVData('languages', validLanguages);
                                            }}
                                        />
                                    )}
                                    {activeSection === 'projects' && (
                                        <ProjectsSection
                                            data={cv.projects || [] as any}
                                            onChange={(data: any) => updateCVData('projects', data)}
                                        />
                                    )}
                                    {activeSection === 'certifications' && (
                                        <CertificationsSection
                                            data={cv.certifications || [] as any}
                                            onChange={(data: any) => updateCVData('certifications', data)}
                                        />
                                    )}
                                    {activeSection === 'volunteer' && (
                                        <VolunteerExperienceSection
                                            data={cv.volunteerExperience || [] as any}
                                            onChange={(data: any) => updateCVData('volunteerExperience', data)}
                                        />
                                    )}
                                    {activeSection === 'customSections' && (
                                        <CustomSectionsSection
                                            data={cv.customSections || []}
                                            onChange={(data: any) => updateCVData('customSections', data)}
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
                                            <path d="M8 2v4h8V2h2a2 2 0 00-2 2v16a2 2 0 00-2-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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
                                    <div className="flex items-center gap-3">
                                        {/* Section Selection Mode Toggle */}
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            <span className="hidden sm:inline text-xs">Canlı güncəllənir</span>
                                        </div>
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
                                                {/* Render different components based on templateId */}
                                                {cv.templateId === 'medium' && (
                                                    <CVPreviewMedium
                                                        cv={{
                                                            ...cv,
                                                            data: {
                                                                personalInfo: {
                                                                    ...cv.personalInfo,
                                                                    name: cv.personalInfo.fullName
                                                                },
                                                                experience: cv.experience || [],
                                                                education: cv.education || [],
                                                                skills: cv.skills || [],
                                                                languages: cv.languages || [],
                                                                projects: cv.projects || [],
                                                                certifications: cv.certifications || [],
                                                                volunteerExperience: cv.volunteerExperience || [],
                                                                publications: cv.publications || [],
                                                                honorsAwards: cv.honorsAwards || [],
                                                                testScores: cv.testScores || [],
                                                                recommendations: cv.recommendations || [],
                                                                courses: cv.courses || [],
                                                                customSections: cv.customSections || [],
                                                                cvLanguage: cv.cvLanguage || 'azerbaijani',
                                                                sectionOrder: cv.sectionOrder || []
                                                            } as any
                                                        }}
                                                    />
                                                )}
                                                {cv.templateId === 'professional-complex' && (
                                                    <CVPreviewA4Complex
                                                        cv={{
                                                            ...cv,
                                                            data: {
                                                                personalInfo: {
                                                                    ...cv.personalInfo,
                                                                    name: cv.personalInfo.fullName
                                                                },
                                                                experience: cv.experience || [],
                                                                education: cv.education || [],
                                                                skills: cv.skills || [],
                                                                languages: cv.languages || [],
                                                                projects: cv.projects || [],
                                                                certifications: cv.certifications || [],
                                                                volunteerExperience: cv.volunteerExperience || [],
                                                                publications: cv.publications || [],
                                                                sectionOrder: cv.sectionOrder || []
                                                            } as any
                                                        }}
                                                    />
                                                )}
                                                {(cv.templateId === 'basic' || cv.templateId === 'professional') && (
                                                    <CVPreviewA4
                                                        cv={{
                                                            ...cv,
                                                            data: {
                                                                personalInfo: {
                                                                    ...cv.personalInfo,
                                                                    name: cv.personalInfo.fullName
                                                                },
                                                                experience: cv.experience || [],
                                                                education: cv.education || [],
                                                                skills: cv.skills || [],
                                                                languages: cv.languages || [],
                                                                projects: cv.projects || [],
                                                                certifications: cv.certifications || [],
                                                                volunteerExperience: cv.volunteerExperience || [],
                                                                publications: cv.publications || [],
                                                                honorsAwards: cv.honorsAwards || [],
                                                                testScores: cv.testScores || [],
                                                                recommendations: cv.recommendations || [],
                                                                courses: cv.courses || [],
                                                                customSections: cv.customSections || [],
                                                                cvLanguage: cv.cvLanguage || 'azerbaijani',
                                                                sectionOrder: cv.sectionOrder || []
                                                            } as any
                                                        }}
                                                        enableSectionSelection={enablePreviewSelection}
                                                        onSectionOrderChange={handleSectionOrderChange}
                                                    />
                                                )}
                                                {/* Fallback for any other template IDs */}
                                                {(cv.templateId !== 'medium' &&
                                                    cv.templateId !== 'professional-complex' &&
                                                    cv.templateId !== 'basic' &&
                                                    cv.templateId !== 'professional') && (
                                                    <CVPreviewA4
                                                        cv={{
                                                            ...cv,
                                                            data: {
                                                                personalInfo: {
                                                                    ...cv.personalInfo,
                                                                    name: cv.personalInfo.fullName
                                                                },
                                                                experience: cv.experience || [],
                                                                education: cv.education || [],
                                                                skills: cv.skills || [],
                                                                languages: cv.languages || [],
                                                                projects: cv.projects || [],
                                                                certifications: cv.certifications || [],
                                                                volunteerExperience: cv.volunteerExperience || [],
                                                                publications: cv.publications || [],
                                                                honorsAwards: cv.honorsAwards || [],
                                                                testScores: cv.testScores || [],
                                                                recommendations: cv.recommendations || [],
                                                                courses: cv.courses || [],
                                                                customSections: cv.customSections || [],
                                                                cvLanguage: cv.cvLanguage || 'azerbaijani',
                                                                sectionOrder: cv.sectionOrder || []
                                                            } as any
                                                        }}
                                                        enableSectionSelection={enablePreviewSelection}
                                                        onSectionOrderChange={handleSectionOrderChange}
                                                    />
                                                )}
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
                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002-2V8l-6-6z"/>
                                                    <path d="M14 2v6h6V2h2a2 2 0 00-2 2v16a2 2 0 00-2-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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

            {/* Section Manager Dialog */}
            {showSectionManager && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    style={{ zIndex: 999999 }}
                    onClick={() => setShowSectionManager(false)}
                >
                    <div
                        className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl"
                        style={{ zIndex: 1000000, position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header - Fixed to top of dialog */}
                        <div
                            className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ position: 'sticky', top: 0, zIndex: 1000001 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg">📋</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-white">
                                            CV Bölmə Sıralaması
                                        </h3>
                                        <p className="text-sm text-purple-100 hidden sm:block">
                                            Bölmələri sürükləyib buraxaraq yenidən sıralayın
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSectionManager(false)}
                                    className="text-white hover:text-purple-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Content with improved scrolling */}
                        <div
                            className="p-4 sm:p-6 overflow-y-auto"
                            style={{
                                position: 'relative',
                                zIndex: 1000000,
                                maxHeight: 'calc(95vh - 140px)',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#cbd5e1 #f1f5f9'
                            }}
                        >
                            <div className="max-w-4xl mx-auto">
                                {/* Mobile Instructions */}
                                <div className="sm:hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-600 text-lg flex-shrink-0">ℹ️</span>
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Mobil istifadə üçün:</p>
                                            <p className="text-blue-700">Bölmələri tutub sürükləyərək yenidən sıralayın</p>
                                        </div>
                                    </div>
                                </div>

                                <CVSectionManager
                                    cvData={{
                                        personalInfo: cv.personalInfo,
                                        experience: cv.experience || [],
                                        education: cv.education || [],
                                        skills: cv.skills || [],
                                        languages: cv.languages || [],
                                        projects: cv.projects || [],
                                        certifications: cv.certifications || [],
                                        volunteerExperience: cv.volunteerExperience || [],
                                        publications: cv.publications || [],
                                        honorsAwards: cv.honorsAwards || [],
                                        testScores: cv.testScores || [],
                                        recommendations: cv.recommendations || [],
                                        courses: cv.courses || [],
                                        cvLanguage: cv.cvLanguage || 'azerbaijani'
                                    }}
                                    onSectionOrderChange={handleSectionOrderChange}
                                    language={cv.cvLanguage || 'azerbaijani'}
                                />
                            </div>
                        </div>

                        {/* Footer - Fixed to bottom of dialog */}
                        <div
                            className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50"
                            style={{ position: 'sticky', bottom: 0, zIndex: 1000001 }}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-600 text-center sm:text-left">
                                    <span className="font-medium">💡 Məsləhət:</span>
                                    <span className="hidden sm:inline ml-1">Dəyişikliklər avtomatik olaraq saxlanılır</span>
                                    <span className="sm:hidden ml-1">Avtomatik saxlanılır</span>
                                </div>
                                <button
                                    onClick={() => setShowSectionManager(false)}
                                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md transform hover:scale-105 active:scale-95"
                                >
                                    Tamam
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced AI Translation Dialog */}
            {showTranslationDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                        {/* Modern Header with Gradient */}
                        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                    </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            AI Peşəkar Tərcümə
                                        </h3>
                                        <p className="text-purple-100 text-sm">
                                            Gemini AI ilə gücləndirilmiş professional tərcümə
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTranslationDialog(false)}
                                    className="text-white hover:text-purple-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Tier Status */}
                            <div className={`p-4 rounded-xl border-2 ${
                                canUseAIFeatures(userTier) 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        canUseAIFeatures(userTier) 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {canUseAIFeatures(userTier) ? '✅' : '⚡'}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${
                                            canUseAIFeatures(userTier) 
                                                ? 'text-green-800' 
                                                : 'text-amber-800'
                                        }`}>
                                            {canUseAIFeatures(userTier)
                                                ? `${userTier} Plan Aktiv`
                                                : 'Premium/Medium Plan Tələb olunur'}
                                        </p>
                                        <p className={`text-sm ${
                                            canUseAIFeatures(userTier) 
                                                ? 'text-green-700' 
                                                : 'text-amber-700'
                                        }`}>
                                            {canUseAIFeatures(userTier)
                                                ? 'AI tərcümə xidmətindən istifadə edə bilərsiniz'
                                                : 'AI tərcümə üçün planınızı yüksəldin'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Features Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-blue-600 text-lg">🧠</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-900 mb-2">Gemini AI Tərcümə Xüsusiyyətləri</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Peşəkar xülasə tərcüməsi</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>İş təcrübəsi tərcüməsi</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Təhsil məlumatları</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Layihə təsvirləri</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Sertifikat məlumatları</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>İndustiya terminləri</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                                            <p className="text-xs text-blue-700 font-medium">
                                                ⚡ Şirkət adları və şəxsi məlumatlar orijinal saxlanılır
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Translation Options */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800 text-center">Tərcümə dilini seçin</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAITranslation('azerbaijani')}
                                        disabled={translating || !canUseAIFeatures(userTier)}
                                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                                            translating || !canUseAIFeatures(userTier)
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100 hover:shadow-lg transform hover:scale-105'
                                        }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">🇦🇿</div>
                                            <div className="font-bold text-lg text-red-800">Azərbaycan dili</div>
                                            <div className="text-sm text-red-600 mt-1">Ana dil tərcüməsi</div>
                                            {translating && (
                                                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAITranslation('english')}
                                        disabled={translating || !canUseAIFeatures(userTier)}
                                        className={`group relative p-6 rounded-xl border-2 transition-all duration-300 ${
                                            translating || !canUseAIFeatures(userTier)
                                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg transform hover:scale-105'
                                        }`}
                                    >
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">🇺🇸</div>
                                            <div className="font-bold text-lg text-blue-800">English</div>
                                            <div className="text-sm text-blue-600 mt-1">Professional quality</div>
                                            {translating && (
                                                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-xl flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Processing Status */}
                            {translating && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                        <div>
                                            <p className="font-semibold text-purple-800">AI tərcümə prosesi davam edir...</p>
                                            <p className="text-sm text-purple-600">Gemini AI CV məzmununuzu analiz edir və tərcümə edir</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upgrade Notice for Non-Premium Users */}
                            {!canUseAIFeatures(userTier) && (
                                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-200 rounded-xl p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-purple-600 text-2xl">💎</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-purple-800 mb-2">
                                                AI Professional Translation
                                            </h4>
                                            <p className="text-sm text-purple-700 mb-3">
                                                CV məzmununuzu Gemini AI ilə dərin analiz edərək professional tərcümə xidməti alın.
                                                İndustiya terminləri və kontekst dəqiq saxlanılır.
                                            </p>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-medium">
                                                    Premium Plan
                                                </span>
                                                <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-medium">
                                                    Medium Plan
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">💡 Məsləhət:</span>
                                <span className="ml-1">Tərcümə avtomatik saxlanılacaq</span>
                            </div>
                            <button
                                onClick={() => setShowTranslationDialog(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Bağla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

