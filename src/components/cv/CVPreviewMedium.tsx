'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Utility function to safely render HTML content
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  // Remove HTML tags but preserve line breaks
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<strong[^>]*>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<b[^>]*>/gi, '')
    .replace(/<\/em>/gi, '')
    .replace(/<em[^>]*>/gi, '')
    .replace(/<\/i>/gi, '')
    .replace(/<i[^>]*>/gi, '')
    .replace(/<\/u>/gi, '')
    .replace(/<u[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/a>/gi, '')
    .replace(/<a[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#39;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
    .trim();
};

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: {
      name?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      summary?: string;
      title?: string;
      profileImage?: string;
    };
    experience?: Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
      location?: string;
    }>;
    education?: Array<{
      id: string;
      institution: string;
      degree: string;
      field?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      gpa?: string;
      description?: string;
    }>;
    skills?: Array<{
      id?: string;
      name: string;
      category?: string;
      level?: string;
    }>;
    languages?: Array<{
      id?: string;
      language?: string;
      name?: string;
      level?: string;
      proficiency?: string;
    }>;
    projects?: Array<{
      id: string;
      name: string;
      description: string;
      technologies?: string | string[];
      startDate?: string;
      endDate?: string;
      url?: string;
    }>;
    certifications?: Array<{
      id: string;
      name: string;
      issuer: string;
      date?: string;
      issueDate?: string;
      expiryDate?: string;
      credentialId?: string;
      url?: string;
      description?: string;
    }>;
    volunteerExperience?: Array<{
      id: string;
      organization: string;
      role: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
      cause?: string;
    }>;
    customSections?: Array<{
      id: string;
      title: string;
      content?: string;
      description?: string;
      type?: 'simple' | 'detailed' | 'timeline';
      isVisible?: boolean;
      priority?: number;
      items?: Array<{
        id: string;
        title: string;
        description?: string;
        date?: string;
        location?: string;
        url?: string;
      }>;
    }>;
    sectionOrder?: Array<{
      id: string;
      type: string;
      isVisible: boolean;
      order?: number;
    }>;
    cvLanguage?: 'azerbaijani' | 'english';
  };
}

interface CVPreviewMediumProps {
  cv: CVData;
  onSectionOrderChange?: (sections: any[]) => void;
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

export default function CVPreviewMedium({ cv, onSectionOrderChange }: CVPreviewMediumProps) {
  const { data } = cv;
  const isEnglish = data.cvLanguage === 'english';

  // Drag and drop state
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if section has data
  const hasData = (sectionId: string): boolean => {
    if (sectionId === 'personalInfo') return true;
    if (sectionId === 'summary') return !!data.personalInfo?.summary;

    const sectionData = data?.[sectionId as keyof typeof data];
    if (Array.isArray(sectionData)) {
      return sectionData.length > 0;
    }
    return !!sectionData;
  };

  // Initialize sections from CV data
  useEffect(() => {
    if (!mounted) return;

    const currentSectionOrder = data?.sectionOrder || [];

    const initializedSections = DEFAULT_SECTIONS.map((defaultSection, index) => {
      const existingConfig = currentSectionOrder.find((s: any) => s.id === defaultSection.id);

      return {
        id: defaultSection.id,
        name: defaultSection.name,
        displayName: defaultSection.displayName,
        isVisible: existingConfig?.isVisible ?? (hasData(defaultSection.id) || defaultSection.alwaysVisible),
        order: existingConfig?.order ?? index,
        hasData: hasData(defaultSection.id),
        icon: defaultSection.icon
      };
    });

    // Filter and sort sections
    const sectionsToShow = initializedSections
      .filter(section => hasData(section.id))
      .sort((a, b) => a.order - b.order);

    setSections([...sectionsToShow]);
  }, [mounted, data?.sectionOrder]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.7';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    if (!draggedSection) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (sectionId !== draggedSection) {
      setDragOverSection(sectionId);
    }
  }, [draggedSection]);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    if (!draggedSection) return;

    e.preventDefault();
    e.stopPropagation();

    if (draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newSections = [...sections];
      const [draggedItem] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, draggedItem);

      // Update order
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      setSections(updatedSections);

      if (onSectionOrderChange) {
        onSectionOrderChange(updatedSections);
      }
    }

    setDraggedSection(null);
    setDragOverSection(null);
  }, [draggedSection, sections, onSectionOrderChange]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSection(null);
    setDragOverSection(null);
  }, []);

  // Draggable section wrapper
  const DraggableSection: React.FC<{
      sectionId: string,
      children: React.ReactNode,
      key?: string
  }> = ({sectionId, children, key}) => {
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

  const texts = {
    experience: isEnglish ? 'WORK EXPERIENCE' : 'İŞ TƏCRÜBƏSİ',
    education: isEnglish ? 'EDUCATION' : 'TƏHSİL',
    skills: isEnglish ? 'SKILLS' : 'BACARIQLAR',
    languages: isEnglish ? 'LANGUAGES' : 'DİLLƏR',
    projects: isEnglish ? 'PROJECTS' : 'LAYİHƏLƏR',
    certifications: isEnglish ? 'CERTIFICATIONS' : 'SERTİFİKATLAR',
    volunteer: isEnglish ? 'VOLUNTEER EXPERIENCE' : 'KÖNÜLLÜ TƏCRÜBƏSİ',
    present: isEnglish ? 'Present' : 'Hazırda',
    to: isEnglish ? 'to' : '-'
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.toLowerCase().includes('present') || dateString.toLowerCase().includes('hazırda')) {
      return texts.present;
    }
    return dateString;
  };

  const formatDateRange = (startDate: string, endDate: string, current: boolean) => {
    const start = formatDate(startDate);
    const end = current ? texts.present : formatDate(endDate);

    if (!start && !end) return '';
    if (!end || current) return `${start} ${texts.to} ${texts.present}`;
    return `${start} ${texts.to} ${end}`;
  };

  return (
    <div
      className="w-full h-full bg-white text-gray-900 overflow-y-auto"
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        scrollbarWidth: 'thin',
        scrollbarColor: '#CBD5E1 #F1F5F9',
        maxHeight: '100vh'
      }}
    >
      {/* Drag status indicator */}
      {draggedSection && (
        <div className="sticky top-0 z-50 bg-blue-500 text-white p-2 text-center text-sm">
          🔄 "{DEFAULT_SECTIONS.find(s => s.id === draggedSection)?.displayName}" sürüklənir...
        </div>
      )}

      <div className="p-6">
        {/* Header Section - Always visible, not draggable */}
        <header className="border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {data.personalInfo.name || data.personalInfo.fullName || 'Your Name'}
          </h1>

          <div className="text-sm text-gray-700 space-y-1">
            {data.personalInfo.email && (
              <div>{data.personalInfo.email}</div>
            )}
            {data.personalInfo.phone && (
              <div>{data.personalInfo.phone}</div>
            )}
            {data.personalInfo.location && (
              <div>{data.personalInfo.location}</div>
            )}
            {data.personalInfo.linkedin && (
              <div>{data.personalInfo.linkedin}</div>
            )}
          </div>

          {data.personalInfo.summary && (
            <div className="mt-3">
              <p className="text-gray-800 leading-relaxed text-sm">
                {stripHtmlTags(data.personalInfo.summary)}
              </p>
            </div>
          )}
        </header>

        {/* Main Content - Draggable sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            switch (section.id) {
              case 'experience':
                if (!data.experience || data.experience.length === 0) return null;
                return (
                  <DraggableSection key="experience" sectionId="experience">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.experience}
                      </h2>
                      <div className="space-y-4">
                        {data.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-bold text-gray-900">{exp.position}</h3>
                                <p className="text-gray-700 font-medium">{exp.company}</p>
                              </div>
                              <span className="text-sm text-gray-600">
                                {formatDateRange(exp.startDate, exp.endDate || '', exp.current)}
                              </span>
                            </div>
                            {exp.location && (
                              <p className="text-sm text-gray-600 mb-2">{exp.location}</p>
                            )}
                            {exp.description && (
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {stripHtmlTags(exp.description)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'education':
                if (!data.education || data.education.length === 0) return null;
                return (
                  <DraggableSection key="education" sectionId="education">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.education}
                      </h2>
                      <div className="space-y-3">
                        {data.education.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                <p className="text-gray-700 font-medium">{edu.institution}</p>
                              </div>
                              <span className="text-sm text-gray-600">
                                {formatDateRange(edu.startDate, edu.endDate || '', edu.current)}
                              </span>
                            </div>
                            {edu.field && (
                              <p className="text-sm text-gray-600">{edu.field}</p>
                            )}
                            {edu.gpa && (
                              <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                            )}
                            {edu.description && (
                              <p className="text-sm text-gray-700">{stripHtmlTags(edu.description)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'skills':
                if (!data.skills || data.skills.length === 0) return null;
                return (
                  <DraggableSection key="skills" sectionId="skills">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.skills}
                      </h2>
                      <div className="text-sm text-gray-700">
                        {data.skills.map((skill, index) => skill.name).join(' • ')}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'languages':
                if (!data.languages || data.languages.length === 0) return null;
                return (
                  <DraggableSection key="languages" sectionId="languages">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.languages}
                      </h2>
                      <div className="space-y-1">
                        {data.languages.map((lang, index) => (
                          <div key={lang.id || index} className="text-sm text-gray-700">
                            <span className="font-medium">{lang.language || lang.name}</span>
                            {(lang.level || lang.proficiency) && (
                              <span className="text-gray-600"> - {lang.level || lang.proficiency}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'projects':
                if (!data.projects || data.projects.length === 0) return null;
                return (
                  <DraggableSection key="projects" sectionId="projects">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.projects}
                      </h2>
                      <div className="space-y-3">
                        {data.projects.map((project) => (
                          <div key={project.id}>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-gray-900">{project.name}</h3>
                              {(project.startDate || project.endDate) && (
                                <span className="text-sm text-gray-600">
                                  {formatDateRange(project.startDate || '', project.endDate || '', false)}
                                </span>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-sm text-gray-700 mb-1">{stripHtmlTags(project.description)}</p>
                            )}
                            {project.technologies && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Technologies: </span>
                                {Array.isArray(project.technologies)
                                  ? project.technologies.join(', ')
                                  : project.technologies}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'certifications':
                if (!data.certifications || data.certifications.length === 0) return null;
                return (
                  <DraggableSection key="certifications" sectionId="certifications">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.certifications}
                      </h2>
                      <div className="space-y-2">
                        {data.certifications.map((cert) => (
                          <div key={cert.id}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                <p className="text-sm text-gray-700">{cert.issuer}</p>
                              </div>
                              {(cert.date || cert.issueDate) && (
                                <span className="text-sm text-gray-600">{formatDate(cert.date || cert.issueDate || '')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'volunteerExperience':
                if (!data.volunteerExperience || data.volunteerExperience.length === 0) return null;
                return (
                  <DraggableSection key="volunteerExperience" sectionId="volunteerExperience">
                    <section>
                      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                        {texts.volunteer}
                      </h2>
                      <div className="space-y-3">
                        {data.volunteerExperience.map((vol) => (
                          <div key={vol.id}>
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <h3 className="font-bold text-gray-900">{vol.role}</h3>
                                <p className="text-gray-700 font-medium">{vol.organization}</p>
                              </div>
                              <span className="text-sm text-gray-600">
                                {formatDateRange(vol.startDate, vol.endDate || '', vol.current)}
                              </span>
                            </div>
                            {vol.description && (
                              <p className="text-sm text-gray-700">{stripHtmlTags(vol.description)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </DraggableSection>
                );

              case 'customSections':
                if (!data.customSections || data.customSections.length === 0) return null;
                return (
                  <DraggableSection key="customSections" sectionId="customSections">
                    <div className="space-y-6">
                      {data.customSections.map((section) => (
                        <section key={section.id}>
                          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-gray-400">
                            {section.title}
                          </h2>
                          <div className="text-sm text-gray-700">
                            {stripHtmlTags(section.content || section.description || '')}
                          </div>
                        </section>
                      ))}
                    </div>
                  </DraggableSection>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
