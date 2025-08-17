// Component to render HTML content safely
import React, {JSX, useEffect, useState, useCallback} from "react";
import { useFontSettings } from "../../hooks/useFontSettings";
import {
  getLabel,
  CVLanguage,
  translateLanguageLevel,
  translateDegree,
  formatExperienceDateRange,
  smartTranslateText
} from "@/lib/cvLanguage";

const SafeHtmlContent: ({content, className, allowHtml}: {
    content: any;
    className?: any;
    allowHtml?: any
}) => (null | JSX.Element) = ({ content, className = '', allowHtml = true }) => {
  if (!content) return null;

  function stripHtmlTags(content: any): string {
    if (!content) return '';
    const str = String(content);
    return str.replace(/<[^>]*>/g, '');
  }

  // For Basic format or when HTML should be stripped, render as plain text
  if (!allowHtml) {
    const plainText = stripHtmlTags(content);
    return (
      <div className={`cv-body ${className}`}>
        {plainText.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < plainText.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // For Medium format, render HTML safely
  return (
    <div
      className={`cv-body ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};


interface PersonalInfo {
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  summary?: string;
  title?: string;
  profileImage?: string;
}

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: PersonalInfo;
    cvLanguage?: CVLanguage;
    sectionNames?: {
      personalInfo?: string;
      experience?: string;
      education?: string;
      skills?: string;
      projects?: string;
      certifications?: string;
      volunteerExperience?: string;
      languages?: string;
      awards?: string;
    };
    experience?: Array<{
      position?: string;
      company?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      gpa?: string;
    }>;
    skills?: Array<string | { name: string; level?: string }>;
    languages?: Array<string | {
      language?: string; 
      name?: string; 
      level?: string; 
      proficiency?: string; 
    }>;
    projects?: Array<{
      name?: string;
      description?: string;
      technologies?: string[];
      url?: string;
    }>;
    certifications?: Array<{
      name?: string;
      issuer?: string;
      date?: string;
    }>;
    volunteerExperience?: Array<{
      role?: string;
      organization?: string;
      cause?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
    }>;
    publications?: Array<any>;
    honorsAwards?: Array<any>;
    testScores?: Array<any>;
    recommendations?: Array<any>;
    courses?: Array<any>;
    customSections?: Array<{
      title?: string;
      items?: Array<{
        title?: string;
        subtitle?: string;
        description?: string;
      }>;
    }>;
    sectionOrder?: Array<{
      id: string;
      type: string;
      isVisible: boolean;
      order?: number;
    }>;
  };
}

interface CVPreviewProps {
  cv: CVData;
  onSectionOrderChange?: (sections: any[]) => void;
  enableSectionSelection?: boolean;
}

interface SectionConfig {
  id: string;
  name: string;
  displayName: string;
  isVisible: boolean;
  order: number;
  hasData: boolean;
  icon: string;
}

const DEFAULT_SECTIONS = [
  { id: 'personalInfo', name: 'personalInfo', displayName: 'Şəxsi Məlumatlar', icon: '👤', alwaysVisible: true },
  { id: 'contact', name: 'contact', displayName: 'Əlaqə', icon: '📞', alwaysVisible: true },
  { id: 'header', name: 'header', displayName: 'Başlıq', icon: '📄', alwaysVisible: true },
  { id: 'summary', name: 'summary', displayName: 'Özət', icon: '📝', alwaysVisible: false },
  { id: 'experience', name: 'experience', displayName: 'İş Təcrübəsi', icon: '💼', alwaysVisible: false },
  { id: 'education', name: 'education', displayName: 'Təhsil', icon: '🎓', alwaysVisible: false },
  { id: 'skills', name: 'skills', displayName: 'Bacarıqlar', icon: '⚡', alwaysVisible: false },
  { id: 'projects', name: 'projects', displayName: 'Layihələr', icon: '🚀', alwaysVisible: false },
  { id: 'certifications', name: 'certifications', displayName: 'Sertifikatlar', icon: '🏆', alwaysVisible: false },
  { id: 'languages', name: 'languages', displayName: 'Dillər', icon: '🌍', alwaysVisible: false },
  { id: 'volunteerExperience', name: 'volunteerExperience', displayName: 'Könüllü İş', icon: '❤️', alwaysVisible: false },
  { id: 'customSections', name: 'customSections', displayName: 'Əlavə Bölmələr', icon: '📋', alwaysVisible: false }
];

const CVPreviewA4: React.FC<CVPreviewProps> = ({
  cv,
  onSectionOrderChange,
  enableSectionSelection = false
}) => {
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize font settings for this CV
  const { fontSettings } = useFontSettings(cv?.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug CV data structure
  console.log('🔍 CVPreviewA4 Debug:', {
    cvId: cv?.id,
    templateId: cv?.templateId,
    hasData: !!cv?.data,
    dataKeys: cv?.data ? Object.keys(cv.data) : [],
    personalInfoName: cv?.data?.personalInfo?.fullName || cv?.data?.personalInfo?.name,
    cvTitle: cv?.title
  });

  // Safely extract data with fallbacks and proper typing
  const safeCV = cv || ({} as CVData);
  const cvData = safeCV.data || ({} as CVData['data']);
  const personalInfo: PersonalInfo = (cvData.personalInfo || {}) as PersonalInfo;
  const fullName = personalInfo.fullName || personalInfo.name || 'İsim Daxil Edilməyib';

  // Get current language for translations
  const currentLanguage: CVLanguage = cvData.cvLanguage || 'azerbaijani';

  // Check if this is Traditional CV template
  const isTraditionalTemplate = cv?.templateId === 'traditional' ||
                               cv?.templateId === '8b26fb4c-7ec1-4c0d-bbd9-4b597fb1df45' ||
                               cv?.templateId?.includes('traditional');

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();

    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSection);
    const targetIndex = newSections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove the dragged section and insert it at the target position
    const [draggedSectionObj] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSectionObj);

    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(updatedSections);

    // Notify parent component about the change
    if (onSectionOrderChange) {
      const sectionOrderData = updatedSections.map(section => ({
        id: section.id,
        type: section.name,
        isVisible: section.isVisible,
        order: section.order
      }));
      onSectionOrderChange(sectionOrderData);
    }

    setDraggedSection(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };


  // Check if section has data
  const hasData = useCallback((sectionId: string): boolean => {
    if (sectionId === 'personalInfo') return true;
    if (sectionId === 'contact') return !!(personalInfo?.phone || personalInfo?.email || personalInfo?.website || personalInfo?.linkedin);
    if (sectionId === 'header') return !!(personalInfo?.fullName || personalInfo?.name || personalInfo?.title);
    if (sectionId === 'summary') return !!personalInfo?.summary;

    const sectionData = cvData?.[sectionId as keyof typeof cvData];
    if (Array.isArray(sectionData)) {
      return sectionData.length > 0;
    }
    return !!sectionData;
  }, [cvData, personalInfo]);

  // Initialize sections from CV data
  useEffect(() => {
    if (!mounted) return;

    const currentSectionOrder = cvData?.sectionOrder || [];
    console.log('🔄 CVPreviewA4: Updating sections with order:', currentSectionOrder);

    const initializedSections = DEFAULT_SECTIONS.map((defaultSection, index) => {
      const existingConfig = currentSectionOrder.find((s: any) => s.id === defaultSection.id);

      return {
        id: defaultSection.id,
        name: defaultSection.name,
        displayName: defaultSection.displayName,
        isVisible: existingConfig?.isVisible ?? (defaultSection.alwaysVisible || hasData(defaultSection.id)),
        order: existingConfig?.order ?? index,
        hasData: hasData(defaultSection.id),
        icon: defaultSection.icon
      };
    }).sort((a, b) => a.order - b.order);

    setSections(initializedSections);
  }, [cvData, mounted, hasData]);

  // Draggable Section Component
  const DraggableSection: React.FC<{
    sectionId: string;
    children: React.ReactNode;
    className?: string;
    key?: string;
  }> = ({ sectionId, children, className = '' }) => {
    const isDragged = draggedSection === sectionId;
    const isDraggedOver = dragOverSection === sectionId && draggedSection !== sectionId;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, sectionId)}
        onDragOver={(e) => handleDragOver(e, sectionId)}
        onDrop={(e) => handleDrop(e, sectionId)}
        onDragEnd={handleDragEnd}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverSection(null);
          }
        }}
        className={`
          ${className}
          relative group cursor-move
          transition-all duration-200
          ${isDragged ? 'scale-105 rotate-1 z-50' : ''}
          ${isDraggedOver ? 'ring-2 ring-blue-400 bg-blue-50 rounded-lg' : ''}
          hover:shadow-md hover:bg-gray-50 rounded-lg p-2 m-1
        `}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {/* Drag indicator */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white px-2 py-1 rounded text-xs">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Sürükləyin
          </div>
        </div>

        {/* Drop zone indicator */}
        {isDraggedOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium animate-bounce">
              🎯 Buraya burax
            </div>
          </div>
        )}

        {children}
      </div>
    );
  };

  console.log('🎨 Template Check:', {
    templateId: cv?.templateId,
    isTraditional: isTraditionalTemplate
  });

  // If Traditional CV template, render with special layout
  if (isTraditionalTemplate) {
    // Create draggable sections that respect the order
    const renderTraditionalSection = (section: SectionConfig) => {
      switch (section.id) {
        case 'personalInfo':
          return (
            <DraggableSection key={`personalInfo-${section.order}`} sectionId="personalInfo" className="w-full mb-4">
              <div className="cv-traditional-personal-draggable relative">
                {/* Enhanced drag indicator for personal info */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-1 py-1 rounded text-xs z-10">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>

                {personalInfo?.profileImage ? (
                  <img
                    src={personalInfo.profileImage}
                    alt="Profil Şəkli"
                    className="rounded-full w-24 h-24 border-3 border-gray-400 object-cover mx-auto"
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <div className="rounded-full w-24 h-24 border-3 border-gray-400 bg-gray-300 flex items-center justify-center mx-auto" style={{ flexShrink: 0 }}>
                    <span className="text-gray-700 text-xs font-medium">Şəkil</span>
                  </div>
                )}
                

              </div>
            </DraggableSection>
          );

        case 'contact':
          if (!personalInfo?.phone && !personalInfo?.email && !personalInfo?.website && !personalInfo?.linkedin) {
            return null;
          }
          return (
            <DraggableSection key={`contact-${section.order}`} sectionId="contact" className="w-full mb-6">
              <div className="cv-traditional-contact-draggable">
                <h2 className="cv-subheading tracking-wider uppercase mb-3 text-white">{getLabel('personalInfo', currentLanguage)}</h2>
                <div className="border-b-2 border-gray-400 w-10 mb-3"></div>
                <div className="space-y-2 cv-small text-white">
                  {personalInfo?.phone && (
                    <div className="flex items-center break-all">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-white cv-small">{personalInfo.phone}</span>
                    </div>
                  )}
                  {personalInfo?.email && (
                    <div className="flex items-center break-all">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-white cv-small">{personalInfo.email}</span>
                    </div>
                  )}
                  {personalInfo?.website && (
                    <div className="flex items-center break-all">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                      </svg>
                      <span className="text-white cv-small">{personalInfo.website}</span>
                    </div>
                  )}
                  {personalInfo?.linkedin && (
                    <div className="flex items-center break-all">
                      <svg className="h-4 w-4 mr-2 flex-shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                      </svg>
                      <span className="text-white cv-small">{personalInfo.linkedin}</span>
                    </div>
                  )}
                </div>
              </div>
            </DraggableSection>
          );

        case 'education':
          if (!cvData.education || !Array.isArray(cvData.education) || cvData.education.length === 0) return null;
          return (
            <DraggableSection key={`education-${section.order}`} sectionId="education" className="w-full mb-6">
              <div>
                <h2 className="cv-subheading tracking-wider uppercase mb-3 text-white">{getLabel('education', currentLanguage)}</h2>
                <div className="border-b-2 border-gray-400 w-10 mb-3"></div>
                <div className="space-y-3">
                  {cvData.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <h3 className="cv-body text-white">{translateDegree(edu.degree || '', currentLanguage) || edu.institution}</h3>
                      <p className="cv-small text-gray-200">{edu.institution || translateDegree(edu.degree || '', currentLanguage)}</p>
                      <p className="cv-small text-gray-200">
                        {formatExperienceDateRange(edu.startDate, edu.endDate, edu.current || false, currentLanguage)}
                      </p>
                      {edu.gpa && <p className="cv-small text-gray-200">{getLabel('GPA', currentLanguage)}: {edu.gpa}</p>}
                      {edu.field && <p className="cv-small text-gray-200">{getLabel('fieldOfStudy', currentLanguage)}: {edu.field}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </DraggableSection>
          );

        case 'skills':
          if (!cvData.skills || !Array.isArray(cvData.skills) || cvData.skills.length === 0) return null;
          return (
            <DraggableSection key={`skills-${section.order}`} sectionId="skills" className="w-full mb-6">
              <div>
                <h2 className="cv-subheading tracking-wider uppercase mb-3 text-white">{getLabel('skills', currentLanguage)}</h2>
                <div className="border-b-2 border-gray-400 w-10 mb-3"></div>
                <ul className="space-y-1 cv-small list-disc list-inside text-white">
                  {cvData.skills.map((skill: any, index: number) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    const skillLevel = typeof skill === 'object' ? skill.level : undefined;
                    return (
                      <li key={index} className="text-white cv-small">
                        {smartTranslateText(skillName, currentLanguage)}
                        {skillLevel && ` (${smartTranslateText(skillLevel, currentLanguage)})`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </DraggableSection>
          );

        case 'languages':
          if (!cvData.languages || !Array.isArray(cvData.languages) || cvData.languages.length === 0) return null;
          return (
            <DraggableSection key={`languages-${section.order}`} sectionId="languages" className="w-full mb-6">
              <div>
                <h2 className="cv-subheading tracking-wider uppercase mb-3 text-white">{getLabel('languages', currentLanguage)}</h2>
                <div className="border-b-2 border-gray-400 w-10 mb-3"></div>
                <ul className="space-y-1 cv-small list-disc list-inside text-white">
                  {cvData.languages.map((lang: any, index: number) => {
                    const languageName = typeof lang === 'string' ? lang : (lang.language || lang.name || '');
                    const languageLevel = typeof lang === 'object' ? (lang.level || lang.proficiency || '') : '';
                    const translatedLevel = languageLevel ? translateLanguageLevel(languageLevel, currentLanguage) : '';

                    return (
                      <li key={index} className="text-white cv-small">
                        {languageName} {translatedLevel && `(${translatedLevel})`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </DraggableSection>
          );

        case 'certifications':
          if (!cvData.certifications || !Array.isArray(cvData.certifications) || cvData.certifications.length === 0) return null;
          return (
            <DraggableSection key={`certifications-${section.order}`} sectionId="certifications" className="w-full mb-6">
              <div>
                <h2 className="cv-subheading tracking-wider uppercase mb-3 text-white">{getLabel('certifications', currentLanguage)}</h2>
                <div className="border-b-2 border-gray-400 w-10 mb-3"></div>
                <div className="space-y-3">
                  {cvData.certifications.map((cert: any, index: number) => (
                    <div key={index}>
                      <h3 className="cv-body text-white">{cert.name}</h3>
                      <p className="cv-small text-gray-200">
                        {cert.issuer} | {cert.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DraggableSection>
          );

        case 'header':
          return (
            <DraggableSection key={`header-${section.order}`} sectionId="header" className="mb-4">
              <div>
                <h1 className="cv-heading text-gray-800 uppercase leading-tight">
                  {fullName}
                </h1>
                {personalInfo?.title && (
                  <p className="cv-subheading text-gray-600 tracking-wider mt-1 uppercase">
                    {personalInfo.title}
                  </p>
                )}
              </div>
            </DraggableSection>
          );

        case 'summary':
          if (!personalInfo?.summary) return null;
          return (
            <DraggableSection key={`summary-${section.order}`} sectionId="summary" className="mb-6">
              <div>
                <h2 className="cv-subheading text-gray-800 border-b-2 border-gray-300 pb-1 mb-3">{getLabel('summary', currentLanguage)}</h2>
                <SafeHtmlContent
                  content={personalInfo.summary}
                  className="text-gray-600 leading-relaxed"
                  allowHtml={false}
                />
              </div>
            </DraggableSection>
          );

        case 'experience':
          if (!cvData.experience || !Array.isArray(cvData.experience) || cvData.experience.length === 0) return null;
          return (
            <DraggableSection key={`experience-${section.order}`} sectionId="experience" className="mb-8">
              <section>
                <h2 className="cv-subheading text-gray-800 border-b-2 border-gray-300 pb-2 mb-5">{getLabel('experience', currentLanguage)}</h2>
                <div className="space-y-5">
                  {cvData.experience.map((exp: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="cv-subheading text-gray-700">{exp.position}</h3>
                        <p className="cv-small text-gray-500">{exp.startDate} - {exp.current ? getLabel('present', currentLanguage) : exp.endDate}</p>
                      </div>
                      <p className="cv-body text-gray-600 mb-1">{exp.company}</p>
                      {exp.location && <p className="cv-small text-gray-500 mb-2">{exp.location}</p>}
                      {exp.description && (
                        <SafeHtmlContent
                          content={exp.description}
                          className="text-gray-600 leading-relaxed"
                          allowHtml={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </DraggableSection>
          );

        case 'projects':
          if (!cvData.projects || !Array.isArray(cvData.projects) || cvData.projects.length === 0) return null;
          return (
            <DraggableSection key={`projects-${section.order}`} sectionId="projects" className="mb-8">
              <section>
                <h2 className="cv-subheading text-gray-800 border-b-2 border-gray-300 pb-2 mb-5">{getLabel('projects', currentLanguage)}</h2>
                <div className="space-y-5">
                  {cvData.projects.map((project: any, index: number) => (
                    <div key={index}>
                      <h3 className="cv-subheading text-gray-700">{project.name}</h3>
                      {project.description && (
                        <SafeHtmlContent
                          content={project.description}
                          className="text-gray-600 mt-2"
                          allowHtml={false}
                        />
                      )}
                      {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <p className="cv-body text-gray-500 mt-2">
                          <strong>{getLabel('technologies', currentLanguage)}:</strong> {project.technologies.join(', ')}
                        </p>
                      )}
                      {project.url && (
                        <p className="cv-small text-blue-600 mt-1">{project.url}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </DraggableSection>
          );

        case 'volunteerExperience':
          if (!cvData.volunteerExperience || !Array.isArray(cvData.volunteerExperience) || cvData.volunteerExperience.length === 0) return null;
          return (
            <DraggableSection key={`volunteerExperience-${section.order}`} sectionId="volunteerExperience" className="mb-8">
              <section>
                <h2 className="cv-subheading text-gray-800 border-b-2 border-gray-300 pb-2 mb-5">{getLabel('volunteerExperience', currentLanguage)}</h2>
                <div className="space-y-5">
                  {cvData.volunteerExperience.map((vol: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="cv-subheading text-gray-700">{vol.role}</h3>
                        <p className="cv-small text-gray-500">{vol.startDate} - {vol.current ? getLabel('present', currentLanguage) : vol.endDate}</p>
                      </div>
                      <p className="cv-body text-gray-600 mb-1">{vol.organization}</p>
                      {vol.cause && <p className="cv-small text-gray-500 mb-2">{vol.cause}</p>}
                      {vol.description && (
                        <SafeHtmlContent
                          content={vol.description}
                          className="text-gray-600"
                          allowHtml={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </DraggableSection>
          );

        default:
          return null;
      }
    };

    // Filter sections that should appear in sidebar (reordered for better fit)
    const sidebarSections = sections.filter(section =>
      ['personalInfo', 'contact', 'skills', 'languages', 'certifications', 'education'].includes(section.id) &&
      section.isVisible
    );

    // Filter sections for main content (include header and summary now)
    const mainSections = sections.filter(section =>
      ['header', 'summary', 'experience', 'projects', 'volunteerExperience', 'customSections'].includes(section.id) &&
      section.isVisible
    );

    return (
      <div className="w-full h-full bg-white overflow-y-auto" style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#CBD5E1 #F1F5F9'
      }}>
        {/* Drag status indicator */}
        {draggedSection && (
          <div className="sticky top-0 z-50 bg-blue-500 text-white p-2 text-center text-sm">
            🔄 "{DEFAULT_SECTIONS.find(s => s.id === draggedSection)?.displayName}" sürüklənir...
          </div>
        )}

        {/* Traditional CV Template with Sidebar Layout */}
        <div className="flex min-h-[297mm]" style={{ width: '210mm', margin: '0 auto' }}>
          {/* Left Sidebar - Dark Blue with compact sections */}
          <div className="w-[32%] bg-[#0d2438] text-white p-4" style={{ minHeight: '297mm' }}>
            <div className="space-y-4">
              {/* Render all sidebar sections in order */}
              {sidebarSections.map(section => renderTraditionalSection(section))}
            </div>
          </div>

          {/* Right Main Content - White with draggable sections */}
          <div className="w-[68%] p-6" style={{ minHeight: '297mm' }}>
            {/* Render all main content sections in order */}
            {mainSections.map(section => renderTraditionalSection(section))}
          </div>
        </div>
      </div>
    );
  }

  // Default modern template rendering
  if (!cvData || Object.keys(cvData).length === 0) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2h-2V2z"/>
          </svg>
          <h3 className="text-lg font-medium mb-2 text-gray-600">CV məlumatları yoxdur</h3>
          <p className="text-sm text-gray-500">CV formunu doldurun və ya məlumatları import edin</p>
        </div>
      </div>
    );
  }

  // Default template rendering for other templates
  return (
    <div className="w-full h-full bg-white overflow-y-auto" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#CBD5E1 #F1F5F9',
      maxHeight: '100vh',
      fontSize: '14px'
    }}>
      {/* Drag status indicator */}
      {draggedSection && (
        <div className="sticky top-0 z-50 bg-blue-500 text-white p-2 text-center text-sm">
          🔄 "{DEFAULT_SECTIONS.find(s => s.id === draggedSection)?.displayName}" sürüklənir...
        </div>
      )}

      {/* Modern template content */}
      <div className="p-6 space-y-5" style={{ width: '210mm', margin: '0 auto', minHeight: '297mm' }}>
        {/* Header Section */}
        <DraggableSection sectionId="personalInfo" className="text-center">
          <div>
            <h1 className="cv-heading text-gray-800 mb-2">{fullName}</h1>
            {personalInfo?.title && (
              <p className="cv-subheading text-gray-600 mb-4">{personalInfo.title}</p>
            )}
            <div className="flex justify-center gap-4 cv-small text-gray-600">
              {personalInfo?.email && <span>{personalInfo.email}</span>}
              {personalInfo?.phone && <span>{personalInfo.phone}</span>}
              {personalInfo?.website && <span>{personalInfo.website}</span>}
              {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
            </div>
          </div>
        </DraggableSection>

        {/* Summary Section */}
        {personalInfo?.summary && (
          <DraggableSection sectionId="summary">
            <div>
              <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                {getLabel('summary', currentLanguage)}
              </h3>
              <SafeHtmlContent
                content={personalInfo.summary}
                className="cv-body text-gray-600 leading-relaxed"
                allowHtml={false}
              />
            </div>
          </DraggableSection>
        )}

        {/* Render sections in order */}
        {sections.filter(section => section.isVisible && section.id !== 'personalInfo' && section.id !== 'contact' && section.id !== 'summary').map(section => {
          switch (section.id) {
            case 'experience':
              if (!cvData.experience || !Array.isArray(cvData.experience) || cvData.experience.length === 0) return null;
              return (
                <DraggableSection key="experience" sectionId="experience">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('experience', currentLanguage)}
                    </h3>
                    <div className="space-y-4">
                      {cvData.experience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="cv-subheading text-gray-900">{exp.position}</h4>
                              <p className="cv-body text-gray-700">{exp.company}</p>
                              {exp.location && <p className="cv-small text-gray-500">{exp.location}</p>}
                            </div>
                            <span className="cv-small text-gray-500 whitespace-nowrap ml-3">
                              {exp.startDate} - {exp.current ? getLabel('present', currentLanguage) : exp.endDate}
                            </span>
                          </div>
                          {exp.description && (
                            <SafeHtmlContent
                              content={exp.description}
                              className="cv-body text-gray-600 leading-relaxed"
                              allowHtml={false}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'education':
              if (!cvData.education || !Array.isArray(cvData.education) || cvData.education.length === 0) return null;
              return (
                <DraggableSection key="education" sectionId="education">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('education', currentLanguage)}
                    </h3>
                    <div className="space-y-3">
                      {cvData.education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-green-500 pl-3">
                          <h4 className="cv-subheading text-gray-900">{edu.degree}</h4>
                          <p className="cv-body text-gray-700">{edu.institution}</p>
                          <p className="cv-small text-gray-500">
                            {edu.startDate} - {edu.current ? getLabel('present', currentLanguage) : edu.endDate}
                          </p>
                          {edu.gpa && <p className="cv-small text-gray-500">GPA: {edu.gpa}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'skills':
              if (!cvData.skills || !Array.isArray(cvData.skills) || cvData.skills.length === 0) return null;
              return (
                <DraggableSection key="skills" sectionId="skills">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('skills', currentLanguage)}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.map((skill: any, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded cv-small">
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'projects':
              if (!cvData.projects || !Array.isArray(cvData.projects) || cvData.projects.length === 0) return null;
              return (
                <DraggableSection key="projects" sectionId="projects">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('projects', currentLanguage)}
                    </h3>
                    <div className="space-y-3">
                      {cvData.projects.map((project: any, index: number) => (
                        <div key={index} className="border-l-2 border-purple-500 pl-3">
                          <h4 className="cv-subheading text-gray-900">{project.name}</h4>
                          {project.description && (
                            <SafeHtmlContent
                              content={project.description}
                              className="cv-body text-gray-600 leading-relaxed"
                              allowHtml={false}
                            />
                          )}
                          {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                            <p className="cv-body text-gray-500 mt-2">
                              <strong>{getLabel('technologies', currentLanguage)}:</strong> {project.technologies.join(', ')}
                            </p>
                          )}
                          {project.url && (
                            <p className="cv-small text-blue-600 mt-1">{project.url}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'certifications':
              if (!cvData.certifications || !Array.isArray(cvData.certifications) || cvData.certifications.length === 0) return null;
              return (
                <DraggableSection key="certifications" sectionId="certifications">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('certifications', currentLanguage)}
                    </h3>
                    <div className="space-y-2">
                      {cvData.certifications.map((cert: any, index: number) => (
                        <div key={index} className="border-l-2 border-yellow-500 pl-3">
                          <h4 className="cv-subheading text-gray-900">{cert.name}</h4>
                          <p className="cv-small text-gray-700">{cert.issuer}</p>
                          {cert.date && <p className="cv-small text-gray-500">{cert.date}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'languages':
              if (!cvData.languages || !Array.isArray(cvData.languages) || cvData.languages.length === 0) return null;
              return (
                <DraggableSection key="languages" sectionId="languages">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('languages', currentLanguage)}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {cvData.languages.map((lang: any, index: number) => {
                        const languageName = typeof lang === 'string' ? lang : (lang.language || lang.name || '');
                        const languageLevel = typeof lang === 'object' ? (lang.level || lang.proficiency || '') : '';

                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span className="cv-body text-gray-900">{languageName}</span>
                            {languageLevel && (
                              <span className="cv-small text-gray-600">({languageLevel})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'volunteerExperience':
              if (!cvData.volunteerExperience || !Array.isArray(cvData.volunteerExperience) || cvData.volunteerExperience.length === 0) return null;
              return (
                <DraggableSection key="volunteerExperience" sectionId="volunteerExperience">
                  <div>
                    <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                      {getLabel('volunteerExperience', currentLanguage)}
                    </h3>
                    <div className="space-y-3">
                      {cvData.volunteerExperience.map((vol: any, index: number) => (
                        <div key={index} className="border-l-2 border-red-500 pl-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="cv-subheading text-gray-900">{vol.role}</h4>
                              <p className="cv-body text-gray-700">{vol.organization}</p>
                            </div>
                            <span className="cv-small text-gray-500 whitespace-nowrap ml-3">
                              {vol.startDate} - {vol.current ? getLabel('present', currentLanguage) : vol.endDate}
                            </span>
                          </div>
                          {vol.description && (
                            <SafeHtmlContent
                              content={vol.description}
                              className="cv-body text-gray-600 leading-relaxed"
                              allowHtml={false}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'customSections':
              if (!cvData.customSections || !Array.isArray(cvData.customSections) || cvData.customSections.length === 0) return null;
              return (
                <DraggableSection key="customSections" sectionId="customSections">
                  <div className="space-y-4">
                    {cvData.customSections.map((section: any, sectionIndex: number) => {
                      if (!section.items || section.items.length === 0) return null;

                      return (
                        <div key={sectionIndex}>
                          <h3 className="cv-subheading text-gray-800 mb-3 border-b border-gray-300 pb-1">
                            {section.title || 'Əlavə Bölmə'}
                          </h3>
                          <div className="space-y-2">
                            {section.items.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="border-l-2 border-gray-400 pl-3">
                                <h4 className="cv-subheading text-gray-900">{item.title}</h4>
                                {item.subtitle && (
                                  <p className="cv-small text-gray-700">{item.subtitle}</p>
                                )}
                                {item.description && (
                                  <SafeHtmlContent
                                    content={item.description}
                                    className="cv-body text-gray-600 leading-relaxed"
                                    allowHtml={false}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DraggableSection>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default CVPreviewA4;
