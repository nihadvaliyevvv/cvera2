/**
 * Language utilities for CVERA application
 * Handles translation between Azerbaijani and English for CV sections
 */

export type CVLanguage = 'azerbaijani' | 'english';

// Section labels/headers
export const SECTION_LABELS = {
  azerbaijani: {
    personalInfo: 'Şəxsi Məlumatlar',
    summary: 'Professional Özet',
    experience: 'İş Təcrübəsi',
    education: 'Təhsil',
    skills: 'Bacarıqlar',
    languages: 'Dillər',
    projects: 'Layihələr',
    certifications: 'Sertifikatlar',
    volunteerExperience: 'Könüllü Təcrübə',
    publications: 'Nəşrlər',
    honorsAwards: 'Mükafatlar',
    testScores: 'Test Nəticələri',
    recommendations: 'Tövsiyələr',
    courses: 'Kurslar',
    
    // Personal info fields
    fullName: 'Ad Soyad',
    email: 'E-poçt',
    phone: 'Telefon',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    website: 'Veb sayt',
    location: 'Yer',
    professionalSummary: 'Professional Özet',
    
    // Experience fields
    position: 'Vəzifə',
    company: 'Şirkət',
    startDate: 'Başlama tarixi',
    endDate: 'Bitmə tarixi',
    description: 'Təsvir',
    current: 'Hal-hazırda',
    
    // Education fields
    degree: 'Dərəcə',
    institution: 'Təhsil müəssisəsi',
    gpa: 'Orta bal',
    fieldOfStudy: 'Təhsil sahəsi',
    
    // Skill fields
    skillName: 'Bacarıq',
    name: 'Ad',
    category: 'Kateqoriya',
    
    // Language fields
    language: 'Dil',
    level: 'Səviyyə',
    
    // Project fields
    projectName: 'Layihə adı',
    technologies: 'Texnologiyalar',
    url: 'URL',
    
    // Certification fields
    issuer: 'Verən təşkilat',
    date: 'Tarix',
    
    // Volunteer fields
    organization: 'Təşkilat',
    role: 'Rol',
    cause: 'Məqsəd',
    
    // Date formats
    present: 'İndiyədək',
    to: '-',
    
    // Buttons and actions
    add: 'Əlavə et',
    addSection: 'Əlavə et',
    save: 'Yadda saxla',
    cancel: 'Ləğv et',
    delete: 'Sil',
    edit: 'Düzəliş et',
    generate: 'Yarad',
    translate: 'Tərcümə et',
    preview: 'Önizləmə',
    download: 'Yüklə',
    
    // Common terms
    optional: '(İxtiyari)',
    required: '(Məcburi)',
    loading: 'Yüklənir...',
    error: 'Xəta',
    success: 'Uğurlu',
    warning: 'Xəbərdarlıq',
    info: 'Məlumat',
    
    // CV sections titles
    cvLanguage: 'CV Dili',
    template: 'Şablon',
    export: 'İxrac',
    
    // Placeholders
    enterName: 'Adınızı daxil edin',
    enterEmail: 'E-poçt ünvanınızı daxil edin',
    enterPhone: 'Telefon nömrənizi daxil edin',
    enterLinkedin: 'LinkedIn profilinizi daxil edin',
    enterGithub: 'GitHub profilinizi daxil edin',
    enterWebsite: 'Veb saytınızı daxil edin',
    enterLocation: 'Yerləşdiyiniz yeri daxil edin',
    
    // Messages
    noDataAdded: 'Hələ məlumat əlavə edilməyib',
    addFirstItem: 'İlk elementi əlavə et',
    addMoreItems: 'Daha çox əlavə et'
  },
  
  english: {
    personalInfo: 'Personal Information',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Projects',
    certifications: 'Certifications',
    volunteerExperience: 'Volunteer Experience',
    publications: 'Publications',
    honorsAwards: 'Honors & Awards',
    testScores: 'Test Scores',
    recommendations: 'Recommendations',
    courses: 'Courses',
    
    // Personal info fields
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    website: 'Website',
    location: 'Location',
    professionalSummary: 'Professional Summary',
    
    // Experience fields
    position: 'Position',
    company: 'Company',
    startDate: 'Start Date',
    endDate: 'End Date',
    description: 'Description',
    current: 'Current',
    
    // Education fields
    degree: 'Degree',
    institution: 'Institution',
    gpa: 'GPA',
    fieldOfStudy: 'Field of Study',
    
    // Skill fields
    skillName: 'Skill',
    name: 'Name',
    category: 'Category',
    
    // Language fields
    language: 'Language',
    level: 'Level',
    
    // Project fields
    projectName: 'Project Name',
    technologies: 'Technologies',
    url: 'URL',
    
    // Certification fields
    issuer: 'Issuing Organization',
    date: 'Date',
    
    // Volunteer fields
    organization: 'Organization',
    role: 'Role',
    cause: 'Cause',
    
    // Date formats
    present: 'Present',
    to: 'to',
    
    // Buttons and actions
    add: 'Add',
    addSection: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    generate: 'Generate',
    translate: 'Translate',
    preview: 'Preview',
    download: 'Download',
    
    // Common terms
    optional: '(Optional)',
    required: '(Required)',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    
    // CV sections titles
    cvLanguage: 'CV Language',
    template: 'Template',
    export: 'Export',
    
    // Placeholders
    enterName: 'Enter your name',
    enterEmail: 'Enter your email address',
    enterPhone: 'Enter your phone number',
    enterLinkedin: 'Enter your LinkedIn profile',
    enterGithub: 'Enter your GitHub profile',
    enterWebsite: 'Enter your website',
    enterLocation: 'Enter your location',
    
    // Messages
    noDataAdded: 'No data added yet',
    addFirstItem: 'Add first item',
    addMoreItems: 'Add more items'
  }
};

// Language level translations
export const LANGUAGE_LEVELS = {
  azerbaijani: {
    'Native': 'Ana dil',
    'Fluent': 'Sərbəst',
    'Professional': 'Professional',
    'Conversational': 'Danışıq səviyyəsi',
    'Basic': 'Əsas səviyyə',
    'Beginner': 'Başlanğıc'
  },
  english: {
    'Ana dil': 'Native',
    'Sərbəst': 'Fluent',
    'Professional': 'Professional',
    'Danışıq səviyyəsi': 'Conversational',
    'Əsas səviyyə': 'Basic',
    'Başlanğıc': 'Beginner'
  }
};

// Common degree translations
export const DEGREE_TRANSLATIONS = {
  azerbaijani: {
    'Bachelor': 'Bakalavr',
    'Master': 'Magistr',
    'PhD': 'Doktorantura',
    'Associate': 'Assotsiat',
    'High School': 'Orta məktəb',
    'Certificate': 'Sertifikat'
  },
  english: {
    'Bakalavr': 'Bachelor',
    'Magistr': 'Master',
    'Doktorantura': 'PhD',
    'Assotsiat': 'Associate',
    'Orta məktəb': 'High School',
    'Sertifikat': 'Certificate'
  }
};

/**
 * Get translated label for a field/section
 */
export function getLabel(key: string, language: CVLanguage): string {
  return SECTION_LABELS[language][key as keyof typeof SECTION_LABELS[typeof language]] || key;
}

/**
 * Format date range according to language
 */
export function formatDateRange(startDate: string, endDate: string | undefined, language: CVLanguage): string {
  const labels = SECTION_LABELS[language];
  
  if (!endDate) {
    return `${startDate} ${labels.to} ${labels.present}`;
  }
  
  return `${startDate} ${labels.to} ${endDate}`;
}

/**
 * Translate language level
 */
export function translateLanguageLevel(level: string, targetLanguage: CVLanguage): string {
  const translations = LANGUAGE_LEVELS[targetLanguage];
  return translations[level as keyof typeof translations] || level;
}

/**
 * Translate degree name
 */
export function translateDegree(degree: string, targetLanguage: CVLanguage): string {
  const translations = DEGREE_TRANSLATIONS[targetLanguage];
  return translations[degree as keyof typeof translations] || degree;
}

/**
 * Get month names for date formatting
 */
export const MONTH_NAMES = {
  azerbaijani: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ],
  english: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

/**
 * Format date according to language preference
 */
export function formatDate(dateString: string, language: CVLanguage): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const monthNames = MONTH_NAMES[language];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${month} ${year}`;
  } catch {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Get default CV language based on browser/user preference
 */
export function getDefaultCVLanguage(): CVLanguage {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('az') || browserLang.includes('aze')) {
      return 'azerbaijani';
    }
  }
  return 'english'; // Default to English
}

/**
 * Validate CV language
 */
export function isValidCVLanguage(language: string): language is CVLanguage {
  return language === 'azerbaijani' || language === 'english';
}
