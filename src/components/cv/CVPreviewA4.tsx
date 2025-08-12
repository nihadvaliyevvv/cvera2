'use client';

import React, { useState, useEffect } from 'react';
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
    sectionOrder?: Array<{
      id: string;
      name: string;
      displayName: string;
      isVisible: boolean;
      order: number;
      hasData: boolean;
      icon: string;
    }>;
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
    additionalSections?: Record<string, any>; // FIXED: Added missing additionalSections property
  };
}

interface CVPreviewProps {
  cv: CVData;
  enableSectionSelection?: boolean;
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

const CVPreviewA4: React.FC<CVPreviewProps> = ({
  cv,
  enableSectionSelection = false,
  onSectionOrderChange
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if section has data
  const hasData = (sectionId: string): boolean => {
    if (sectionId === 'personalInfo') return true;
    if (sectionId === 'summary') return !!cv.data.personalInfo?.summary;

    // Check for additional sections
    if (sectionId === 'additionalSections') {
      const additionalSections = cv.data.additionalSections;
      return !!(additionalSections && Object.keys(additionalSections).length > 0);
    }

    const sectionData = cv.data?.[sectionId as keyof typeof cv.data];
    if (Array.isArray(sectionData)) {
      return sectionData.length > 0;
    }
    return !!sectionData;
  };

  // Initialize sections from CV data - COMPLETELY FIXED VERSION
  useEffect(() => {
    if (!mounted) return;

    const currentSectionOrder = cv.data?.sectionOrder || [];

    // Create sections in the correct order
    let initializedSections = DEFAULT_SECTIONS.map((defaultSection, index) => {
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

    console.log('🏁 INITIAL SECTIONS:', sectionsToShow.map(s => ({ id: s.id, order: s.order })));
    setSections(sectionsToShow);
  }, [cv.data, mounted]);

  // ULTRA SIMPLE drag handlers - GUARANTEED TO WORK
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    if (!enableSectionSelection) return;

    console.log('🚀 STARTING DRAG:', sectionId);
    setDraggedSection(sectionId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    if (!enableSectionSelection || !draggedSection) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedSection !== sectionId) {
      setDragOverSection(sectionId);
    }
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    if (!enableSectionSelection || !draggedSection) return;

    e.preventDefault();
    e.stopPropagation();
    console.log('💥 DROP:', draggedSection, 'onto', sectionId);

    if (draggedSection !== sectionId) {
      // IMMEDIATE REORDER - NO WAITING
      const newSections = [...sections];
      const fromIndex = newSections.findIndex(s => s.id === draggedSection);
      const toIndex = newSections.findIndex(s => s.id === sectionId);

      console.log('📍 MOVING FROM', fromIndex, 'TO', toIndex);

      if (fromIndex !== -1 && toIndex !== -1) {
        // Remove and insert
        const [movedSection] = newSections.splice(fromIndex, 1);
        newSections.splice(toIndex, 0, movedSection);

        // Update orders
        const updatedSections = newSections.map((section, index) => ({
          ...section,
          order: index
        }));

        console.log('✨ NEW ORDER:', updatedSections.map(s => s.id));

        // FORCE UPDATE WITH NEW REFERENCE
        setSections([...updatedSections]);

        // Notify parent
        if (onSectionOrderChange) {
          onSectionOrderChange(updatedSections);
        }
      }
    }

    // FORCE END THE DRAG OPERATION
    setDraggedSection(null);
    setDragOverSection(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    console.log('🏁 DRAG ENDED - CLEANUP');
    setDraggedSection(null);
    setDragOverSection(null);
    setIsDragging(false);
  };

  // ENHANCED drag overlay with better event handling
  const SimpleDragOverlay: React.FC<{
    sectionId: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ sectionId, children, className = '' }) => {
    if (!enableSectionSelection) {
      return <div className={className}>{children}</div>;
    }

    const isSelected = selectedSection === sectionId;
    const isDragged = draggedSection === sectionId;
    const isDraggedOver = dragOverSection === sectionId;
    const currentIndex = sections.findIndex(s => s.id === sectionId);

    // Move section up
    const moveSectionUp = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        const newSections = [...sections];
        [newSections[currentIndex], newSections[currentIndex - 1]] =
        [newSections[currentIndex - 1], newSections[currentIndex]];

        const updatedSections = newSections.map((section, index) => ({
          ...section,
          order: index
        }));

        setSections(updatedSections);
        if (onSectionOrderChange) {
          onSectionOrderChange(updatedSections);
        }
      }
    };

    // Move section down
    const moveSectionDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentIndex < sections.length - 1) {
        const newSections = [...sections];
        [newSections[currentIndex], newSections[currentIndex + 1]] =
        [newSections[currentIndex + 1], newSections[currentIndex]];

        const updatedSections = newSections.map((section, index) => ({
          ...section,
          order: index
        }));

        setSections(updatedSections);
        if (onSectionOrderChange) {
          onSectionOrderChange(updatedSections);
        }
      }
    };

    return (
      <div
        key={sectionId}
        draggable={enableSectionSelection}
        onDragStart={(e) => handleDragStart(e, sectionId)}
        onDragOver={(e) => handleDragOver(e, sectionId)}
        onDrop={(e) => handleDrop(e, sectionId)}
        onDragEnd={handleDragEnd}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverSection(null);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSection(isSelected ? null : sectionId);
        }}
        className={`
          ${className}
          group relative
          transition-all duration-200
          ${enableSectionSelection ? 'cursor-grab active:cursor-grabbing select-none' : ''}
          ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
          ${isDragged ? 'opacity-60 scale-105 z-50' : ''}
          ${isDraggedOver ? 'ring-2 ring-green-400 bg-green-50' : ''}
          ${enableSectionSelection ? 'hover:ring-1 hover:ring-gray-300 hover:bg-gray-50' : ''}
          rounded-lg p-2 m-1
        `}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none'
        }}
      >
        {/* Hover Controls - Always visible on hover */}
        {enableSectionSelection && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <div className="flex items-center gap-1 bg-white shadow-lg rounded-lg border border-gray-200 p-1">
              {/* Move Up Button */}
              <button
                onClick={moveSectionUp}
                disabled={currentIndex === 0}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                  currentIndex === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
                }`}
                title="Yuxarı köçür"
              >
                ↑
              </button>

              {/* Move Down Button */}
              <button
                onClick={moveSectionDown}
                disabled={currentIndex === sections.length - 1}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                  currentIndex === sections.length - 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
                }`}
                title="Aşağı köçür"
              >
                ↓
              </button>

              {/* Drag Handle */}
              <div
                className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-all"
                title="Sürükləyib sırasını dəyiş"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Section Number Badge */}
              <div className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold">
                {currentIndex + 1}
              </div>
            </div>
          </div>
        )}

        {/* Drop indicator */}
        {isDraggedOver && draggedSection !== sectionId && (
          <div className="absolute inset-0 border-2 border-dashed border-green-400 rounded-lg bg-green-100 bg-opacity-30 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg animate-pulse">
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
    return (cv.data.sectionNames as Record<string, string | undefined>)?.[sectionKey] ||
           getLabel(sectionKey as any, cv.data.cvLanguage || 'azerbaijani') ||
           defaultName;
  };

  const fullName = cv.data.personalInfo?.fullName || cv.data.personalInfo?.name || '';

  // Template type mapping
  const templateIdMap = {
    'b57fdbf2-9401-41d3-8d7b-efe6340781a2': 'basic',
    '89243f3c-97f0-4cac-9818-9457393bc328': 'resumonk',
    '12c867e5-82a4-45ce-a3f0-0d237d0f1ed4': 'modern',
    'fca43d33-c88a-413b-860d-0341cd47fa44': 'executive'
  };

  const getTemplateType = (templateId: string): string => {
    if (templateIdMap[templateId as keyof typeof templateIdMap]) {
      return templateIdMap[templateId as keyof typeof templateIdMap];
    }
    if (templateId?.includes('Basic Template') || templateId === 'basic') return 'basic';
    if (templateId?.includes('Resumonk Bold') || templateId === 'resumonk-bold') return 'resumonk';
    if (templateId?.includes('Modern Creative') || templateId === 'modern') return 'modern';
    if (templateId?.includes('Executive Premium') || templateId === 'executive') return 'executive';
    return 'basic';
  };

  const templateType = getTemplateType(cv.templateId);

  // RESTORE ORIGINAL TEMPLATE RENDERING WITH ENHANCED SCROLL
  if (templateType === 'basic' || enableSectionSelection) {
    return (
      <div
        className="w-full h-full bg-white overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 #F1F5F9',
          maxHeight: '100vh'
        }}
      >
        {/* Enhanced selection mode indicator */}
        {enableSectionSelection && (
          <div
            className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b-2 border-blue-200 p-4 shadow-lg"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center gap-3 text-sm text-blue-800">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                ⚡
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4h2v2H4V4zm0 5h2v2H4V9zm0 5h2v2H4v-2zm5-10h2v2H9V4zm0 5h2v2H9V9zm0 5h2v2H9v-2zm5-10h2v2h-2V4zm0 5h2v2h-2V9zm0 5h2v2h-2v-2z"/>
                  </svg>
                  <span className="font-bold">Seçim Modu Aktiv:</span>
                  <span>Bölmələri seçib sürükləyərək sıralayın</span>
                </div>
                {selectedSection && (
                  <div className="mt-2 text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block">
                    <span className="font-semibold">Seçilmiş:</span>
                    <span className="ml-1">
                      {DEFAULT_SECTIONS.find(s => s.id === selectedSection)?.icon} {DEFAULT_SECTIONS.find(s => s.id === selectedSection)?.displayName}
                    </span>
                  </div>
                )}
              </div>
              {isDragging && (
                <div className="flex items-center gap-2 text-purple-600 animate-pulse">
                  <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4h2v2H4V4zm0 5h2v2H4V9zm0 5h2v2H4v-2zm5-10h2v2H9V4zm0 5h2v2H9V9zm0 5h2v2H9v-2zm5-10h2v2h-2V4zm0 5h2v2h-2V9zm0 5h2v2h-2v-2z"/>
                  </svg>
                  <span className="text-sm font-bold">Sürüklənir...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main content with proper spacing and scroll */}
        <div className="p-8 space-y-8 min-h-full">
          {/* Render sections in their current order with SIMPLE drag overlay */}
          {sections.map((section) => {
            switch (section.id) {
              case 'personalInfo':
                return (
                  <SimpleDragOverlay key="personalInfo" sectionId="personalInfo" className="mb-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
                      {cv.data.personalInfo?.title && (
                        <h2 className="text-xl text-gray-600 mb-4">{cv.data.personalInfo.title}</h2>
                      )}
                      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-4">
                        {cv.data.personalInfo?.email && (
                          <span className="flex items-center gap-1">
                            <span>📧</span> {cv.data.personalInfo.email}
                          </span>
                        )}
                        {cv.data.personalInfo?.phone && (
                          <span className="flex items-center gap-1">
                            <span>📱</span> {cv.data.personalInfo.phone}
                          </span>
                        )}
                        {cv.data.personalInfo?.linkedin && (
                          <span className="flex items-center gap-1">
                            <span>🔗</span> LinkedIn
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
                  </SimpleDragOverlay>
                );

              case 'experience':
                if (!cv.data.experience || cv.data.experience.length === 0) return null;
                return (
                  <SimpleDragOverlay key="experience" sectionId="experience" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'education':
                if (!cv.data.education || cv.data.education.length === 0) return null;
                return (
                  <SimpleDragOverlay key="education" sectionId="education" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'skills':
                if (!cv.data.skills || cv.data.skills.length === 0) return null;
                return (
                  <SimpleDragOverlay key="skills" sectionId="skills" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'projects':
                if (!cv.data.projects || cv.data.projects.length === 0) return null;
                return (
                  <SimpleDragOverlay key="projects" sectionId="projects" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'certifications':
                if (!cv.data.certifications || cv.data.certifications.length === 0) return null;
                return (
                  <SimpleDragOverlay key="certifications" sectionId="certifications" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'languages':
                if (!cv.data.languages || cv.data.languages.length === 0) return null;
                return (
                  <SimpleDragOverlay key="languages" sectionId="languages" className="mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                        {getSectionName('languages', 'Dillər')}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {cv.data.languages.map((lang: any, index: number) => {
                          // Handle both old and new field names for compatibility
                          const languageName = typeof lang === 'string'
                            ? lang
                            : (lang.language || lang.name || '');
                          const languageLevel = typeof lang === 'object'
                            ? (lang.level || lang.proficiency || '')
                            : '';

                          // Translate levels to Azerbaijani for display
                          const levelTranslations = {
                            'Basic': 'Əsas',
                            'Conversational': 'Danışıq',
                            'Professional': 'Professional',
                            'Native': 'Ana dili'
                          };

                          const displayLevel = levelTranslations[languageLevel as keyof typeof levelTranslations] || languageLevel;

                          return (
                            <div key={index} className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                {languageName}
                              </span>
                              {displayLevel && (
                                <span className="text-sm text-gray-600">({displayLevel})</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </SimpleDragOverlay>
                );

              case 'volunteerExperience':
                if (!cv.data.volunteerExperience || cv.data.volunteerExperience.length === 0) return null;
                return (
                  <SimpleDragOverlay key="volunteerExperience" sectionId="volunteerExperience" className="mb-8">
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
                  </SimpleDragOverlay>
                );

              case 'customSections':
                if (!cv.data.customSections || cv.data.customSections.length === 0) return null;

                // Debug: CVPreviewA4 custom sections
                console.log('🔍 CVPreviewA4 Custom Sections Debug:', {
                  componentName: 'CVPreviewA4.tsx',
                  customSectionsLength: cv.data.customSections.length,
                  sections: cv.data.customSections.map(s => ({
                    title: s.title,
                    itemsCount: s.items?.length || 0,
                    isVisible: s.isVisible
                  }))
                });

                return (
                  <SimpleDragOverlay key="customSections" sectionId="customSections" className="mb-8">
                    <div className="space-y-6">
                      {cv.data.customSections.map((section: any, sectionIndex: number) => {
                        // Only render visible sections
                        if (section.isVisible === false) return null;

                        // Debug: Individual section debug
                        console.log('🔍 CVPreviewA4 Individual Section:', {
                          title: section.title,
                          itemsLength: section.items?.length || 0,
                          items: section.items
                        });

                        return (
                          <div key={sectionIndex}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-1">
                              {section.title || 'Əlavə Bölmə'}
                            </h3>

                            {section.description && (
                              <p className="text-sm text-gray-600 mb-3 italic">{section.description}</p>
                            )}


                            {section.items && section.items.length > 0 && (
                              <div className="space-y-3">
                                {section.items.map((item: any, itemIndex: number) => {
                                  // Debug: Individual item
                                  console.log('🔍 CVPreviewA4 Item:', {
                                    itemIndex,
                                    title: item.title,
                                    description: item.description
                                  });

                                  return (
                                    <div key={itemIndex} className="border-l-2 border-green-500 pl-4  p-3 rounded">
                                      {/* Different rendering based on section type */}
                                      {section.type === 'simple' && (
                                        <div>
                                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                                          {item.description && (
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                          )}
                                        </div>
                                      )}

                                      {section.type === 'detailed' && (
                                        <div>
                                          <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                                            {item.location && (
                                              <span className="text-sm text-gray-500 ml-4">{item.location}</span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                          )}
                                          {item.url && (
                                            <a
                                              href={item.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                                            >
                                              {item.url}
                                            </a>
                                          )}
                                        </div>
                                      )}

                                      {section.type === 'timeline' && (
                                        <div>
                                          <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                                            {item.date && (
                                              <span className="text-sm text-gray-500 ml-4">{item.date}</span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                          )}
                                        </div>
                                      )}

                                      {/* Default rendering if no type is specified */}
                                      {!section.type && (
                                        <div>
                                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                                          {item.description && (
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                          )}
                                        </div>
                                      )}


                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SimpleDragOverlay>
                );

              // Əlavə bölmələri ayrıca render et (additionalSections)
              case 'additionalSections':
                // additionalSections məlumatlarını yoxla
                const additionalSections = (cv.data as any).additionalSections;
                if (!additionalSections || Object.keys(additionalSections).length === 0) return null;

                console.log('🔍 CVPreviewA4 Additional Sections Debug:', {
                  componentName: 'CVPreviewA4.tsx',
                  additionalSections: additionalSections,
                  sectionsCount: Object.keys(additionalSections).length
                });

                return (
                  <SimpleDragOverlay key="additionalSections" sectionId="additionalSections" className="mb-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-orange-300 pb-1">
                        📋 Əlavə Bölmələr
                      </h3>

                      {Object.entries(additionalSections).map(([sectionId, sectionData]: [string, any], index: number) => {
                        if (!sectionData || sectionData.isVisible === false) return null;

                        console.log('🔍 CVPreviewA4 Additional Section Item:', {
                          sectionId,
                          title: sectionData.title,
                          itemsCount: sectionData.items?.length || 0
                        });

                        return (
                          <div key={sectionId} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-orange-300 pb-1">
                              {sectionData.title || `Əlavə Bölmə ${index + 1}`}
                            </h4>

                            {sectionData.description && (
                              <p className="text-sm text-gray-600 mb-3 italic">{sectionData.description}</p>
                            )}

                            {(!sectionData.items || sectionData.items.length === 0) && (
                              <div className="p-3 bg-orange-100 border border-orange-300 rounded">
                                <p className="text-sm text-orange-800">⚠️ Bu əlavə bölmədə element yoxdur!</p>
                              </div>
                            )}

                            {sectionData.items && sectionData.items.length > 0 && (
                              <div className="space-y-3">
                                {sectionData.items.map((item: any, itemIndex: number) => (
                                  <div key={itemIndex} className="border-l-2 border-orange-500 pl-4 bg-white rounded p-3">
                                    <div>
                                      <h5 className="font-medium text-gray-900">{item.title || `Element ${itemIndex + 1}`}</h5>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                      )}
                                      {item.date && (
                                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                      )}
                                      {item.url && (
                                        <a
                                          href={item.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                                        >
                                          {item.url}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SimpleDragOverlay>
                );
            }
          }).filter(Boolean)}
        </div>

        {/* Instructions for selection mode */}
        {enableSectionSelection && sections.length > 1 && (
          <div className="sticky bottom-0 p-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <span>💡</span>
                <span>Təlimatlar:</span>
              </div>
              <ul className="text-xs space-y-1 ml-6">
                <li>• Bölməni seçmək üçün üzərinə klikləyin</li>
                <li>• Sürükləyib buraxaraq yenidən sıralayın</li>
                <li>• Sol tərəfdəki tutacaqdan istifadə edin</li>
                <li>• Dəyişikliklər avtomatik saxlanılır</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For other templates, return a simple structure with scroll
  return (
    <div className="w-full h-full bg-white overflow-y-auto" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e1 #f1f5f9'
    }}>
      <div className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
          <p className="text-gray-600 mt-2">Template: {templateType}</p>
        </div>

        {enableSectionSelection && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Section selection is available for this template. Use the section manager for full control.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreviewA4;
