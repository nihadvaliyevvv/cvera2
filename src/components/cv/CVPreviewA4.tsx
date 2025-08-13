'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CVLanguage, getLabel } from '@/lib/cvLanguage';

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
      website?: string;
      linkedin?: string;
      summary?: string;
      title?: string;
      profileImage?: string;
    };
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
    experience?: Array<any>;
    education?: Array<any>;
    skills?: Array<any>;
    languages?: Array<any>;
    projects?: Array<any>;
    certifications?: Array<any>;
    volunteerExperience?: Array<any>;
    publications?: Array<any>;
    honorsAwards?: Array<any>;
    testScores?: Array<any>;
    recommendations?: Array<any>;
    courses?: Array<any>;
    customSections?: Array<any>;
    sectionOrder?: Array<{
      id: string;
      name: string;
      displayName: string;
      isVisible: boolean;
      order: number;
      hasData: boolean;
      icon: string;
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
  onSectionOrderChange
}) => {
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
    if (sectionId === 'summary') return !!cv.data.personalInfo?.summary;

    const sectionData = cv.data?.[sectionId as keyof typeof cv.data];
    if (Array.isArray(sectionData)) {
      return sectionData.length > 0;
    }
    return !!sectionData;
  };

  // Initialize sections from CV data - FIXED for real-time updates
  useEffect(() => {
    if (!mounted) return;

    const currentSectionOrder = cv.data?.sectionOrder || [];
    console.log('🔄 CVPreviewA4: Updating sections with order:', currentSectionOrder);

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

    console.log('📄 CVPreviewA4 sections updated:', sectionsToShow.map(s => ({ id: s.id, order: s.order })));

    // Force update sections state
    setSections([...sectionsToShow]);
  }, [mounted, cv.data?.sectionOrder]); // Fixed dependency array

  // Simple drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    console.log('🚀 Drag başladı:', sectionId);
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);

    // Add visual feedback
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
    
    console.log('🎯 Drop:', { draggedSection, targetSectionId });

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

      console.log('✅ Yeni sıralama:', updatedSections.map(s => ({ id: s.id, order: s.order })));

      setSections(updatedSections);

      if (onSectionOrderChange) {
        onSectionOrderChange(updatedSections);
      }
    }

    setDraggedSection(null);
    setDragOverSection(null);
  }, [draggedSection, sections, onSectionOrderChange]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    console.log('🏁 Drag bitdi');
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSection(null);
    setDragOverSection(null);
  }, []);

  // Draggable section wrapper
  const DraggableSection: React.FC<{
    sectionId: string;
    children: React.ReactNode;
    className?: string;
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

  // Helper function to get section name
  const getSectionName = (sectionKey: string, defaultName: string): string => {
    return getLabel(sectionKey as any, cv.data.cvLanguage || 'azerbaijani') || defaultName;
  };

  const fullName = cv.data.personalInfo?.fullName || cv.data.personalInfo?.name || '';

  return (
    <div
      className="w-full h-full bg-white overflow-y-auto"
      style={{
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

      {/* Main content */}
      <div className="p-8 space-y-6">
        {sections.map((section) => {
          switch (section.id) {
            case 'personalInfo':
              return (
                <DraggableSection key="personalInfo" sectionId="personalInfo">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
                    {cv.data.personalInfo?.title && (
                      <h2 className="text-xl text-gray-600 mb-4">{cv.data.personalInfo.title}</h2>
                    )}
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-4">
                      {cv.data.personalInfo?.email && (
                        <span className="flex items-center gap-1">
                          📧 {cv.data.personalInfo.email}
                        </span>
                      )}
                      {cv.data.personalInfo?.phone && (
                        <span className="flex items-center gap-1">
                          📱 {cv.data.personalInfo.phone}
                        </span>
                      )}
                      {cv.data.personalInfo?.linkedin && (
                        <span className="flex items-center gap-1">
                          🔗 LinkedIn
                        </span>
                      )}
                    </div>
                    {cv.data.personalInfo?.summary && (
                      <div className="text-left max-w-4xl mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                          {getSectionName('summary', 'Özət')}
                        </h3>
                        <div
                          className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: cv.data.personalInfo.summary || '' }}
                        />
                      </div>
                    )}
                  </div>
                </DraggableSection>
              );

            case 'experience':
              if (!cv.data.experience || cv.data.experience.length === 0) return null;
              return (
                <DraggableSection key="experience" sectionId="experience">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('experience', 'İş Təcrübəsi')}
                    </h3>
                    <div className="space-y-4">
                      {cv.data.experience.map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                              <p className="text-gray-700">{exp.company}</p>
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                              {exp.startDate} - {exp.current ? 'Hazırda' : exp.endDate}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'education':
              if (!cv.data.education || cv.data.education.length === 0) return null;
              return (
                <DraggableSection key="education" sectionId="education">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('education', 'Təhsil')}
                    </h3>
                    <div className="space-y-4">
                      {cv.data.education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-green-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                              <p className="text-gray-700">{edu.institution}</p>
                              {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                              {edu.startDate} - {edu.current ? 'Hazırda' : edu.endDate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'skills':
              if (!cv.data.skills || cv.data.skills.length === 0) return null;
              return (
                <DraggableSection key="skills" sectionId="skills">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('skills', 'Bacarıqlar')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {cv.data.skills.map((skill: any, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'projects':
              if (!cv.data.projects || cv.data.projects.length === 0) return null;
              return (
                <DraggableSection key="projects" sectionId="projects">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('projects', 'Layihələr')}
                    </h3>
                    <div className="space-y-4">
                      {cv.data.projects.map((project: any, index: number) => (
                        <div key={index} className="border-l-2 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'certifications':
              if (!cv.data.certifications || cv.data.certifications.length === 0) return null;
              return (
                <DraggableSection key="certifications" sectionId="certifications">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('certifications', 'Sertifikatlar')}
                    </h3>
                    <div className="space-y-3">
                      {cv.data.certifications.map((cert: any, index: number) => (
                        <div key={index} className="border-l-2 border-yellow-500 pl-4">
                          <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                          <p className="text-sm text-gray-700">{cert.issuer}</p>
                          {cert.date && <p className="text-xs text-gray-500">{cert.date}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'languages':
              if (!cv.data.languages || cv.data.languages.length === 0) return null;
              return (
                <DraggableSection key="languages" sectionId="languages">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('languages', 'Dillər')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {cv.data.languages.map((lang: any, index: number) => {
                        const languageName = typeof lang === 'string' ? lang : (lang.language || lang.name || '');
                        const languageLevel = typeof lang === 'object' ? (lang.level || lang.proficiency || '') : '';

                        return (
                          <div key={index} className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{languageName}</span>
                            {languageLevel && (
                              <span className="text-sm text-gray-600">({languageLevel})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'volunteerExperience':
              if (!cv.data.volunteerExperience || cv.data.volunteerExperience.length === 0) return null;
              return (
                <DraggableSection key="volunteerExperience" sectionId="volunteerExperience">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                      {getSectionName('volunteerExperience', 'Könüllü Təcrübə')}
                    </h3>
                    <div className="space-y-4">
                      {cv.data.volunteerExperience.map((vol: any, index: number) => (
                        <div key={index} className="border-l-2 border-red-500 pl-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{vol.role}</h4>
                              <p className="text-gray-700">{vol.organization}</p>
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                              {vol.startDate} - {vol.current ? 'Hazırda' : vol.endDate}
                            </span>
                          </div>
                          {vol.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">{vol.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DraggableSection>
              );

            case 'customSections':
              if (!cv.data.customSections || cv.data.customSections.length === 0) return null;
              return (
                <DraggableSection key="customSections" sectionId="customSections">
                  <div className="space-y-6">
                    {cv.data.customSections.map((section: any, sectionIndex: number) => {
                      if
