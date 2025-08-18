'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CVLanguage, getLabel } from '@/lib/cvLanguage';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: any;
    experience?: any[];
    education?: any[];
    skills?: Array<{
      id?: string;
      name: string;
      level?: string;
      type?: 'hard' | 'soft';
    }>;
    projects?: any[];
    certifications?: any[];
    volunteerExperience?: any[];
    languages?: any[];
    sectionOrder?: any[];
    cvLanguage?: CVLanguage;
    [key: string]: any;
  };
}

interface CVPreviewDraggableProps {
  cv: CVData;
  onSectionOrderChange?: (sections: any[]) => void;
  enableDragDrop?: boolean;
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
];

export default function CVPreviewDraggable({ cv, onSectionOrderChange, enableDragDrop = true }: CVPreviewDraggableProps) {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if section has data
  const hasData = (sectionId: string): boolean => {
    if (sectionId === 'personalInfo') return true;
    if (sectionId === 'summary') return !!cv.data.personalInfo?.summary;

    const sectionData = cv.data?.[sectionId];
    if (Array.isArray(sectionData)) {
      return sectionData.length > 0;
    }
    return !!sectionData;
  };

  // Initialize sections from CV data
  useEffect(() => {
    if (!mounted) return;

    const currentSectionOrder = cv.data?.sectionOrder || [];

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

    // Sort by order and filter visible sections
    const visibleSections = initializedSections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order);

    setSections(visibleSections);
  }, [cv.data, mounted]);

  // Debounced auto-save section order changes
  const saveSectionOrder = useCallback(async (newSections: SectionConfig[]) => {
    try {
      if (!cv.id) {
        console.warn('⚠️ CV ID yoxdur, yaddaşda lokal olaraq saxlanılır');
        // Store in localStorage as fallback
        const sectionOrderData = newSections.map((section, index) => ({
          id: section.id,
          type: section.name,
          isVisible: section.isVisible,
          order: index,
          enabled: section.isVisible
        }));
        localStorage.setItem(`cv_section_order_${cv.title}`, JSON.stringify(sectionOrderData));
        if (onSectionOrderChange) {
          onSectionOrderChange(sectionOrderData);
        }
        return;
      }

      const sectionOrderData = newSections.map((section, index) => ({
        id: section.id,
        type: section.name,
        isVisible: section.isVisible,
        order: index,
        enabled: section.isVisible
      }));

      console.log('💾 Section order saxlanılır:', sectionOrderData);

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token tapılmadı, lokal yaddaşa saxlanılır');
        localStorage.setItem(`cv_section_order_${cv.id}`, JSON.stringify(sectionOrderData));
        if (onSectionOrderChange) {
          onSectionOrderChange(sectionOrderData);
        }
        return;
      }

      const response = await fetch('/api/cv/save-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cvId: cv.id,
          sectionOrder: sectionOrderData,
          cvData: {
            ...cv.data,
            sectionOrder: sectionOrderData
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Section order saxlanıldı:', result.message);
        // Also save to localStorage as backup
        localStorage.setItem(`cv_section_order_${cv.id}`, JSON.stringify(sectionOrderData));
      } else {
        console.error('❌ Server saxlaya bilmədi, lokal yaddaşa saxlanılır');
        localStorage.setItem(`cv_section_order_${cv.id}`, JSON.stringify(sectionOrderData));
      }

      // Notify parent component regardless of server response
      if (onSectionOrderChange) {
        onSectionOrderChange(sectionOrderData);
      }
    } catch (error) {
      console.error('❌ Section order save error:', error);
      // Fallback to localStorage
      const sectionOrderData = newSections.map((section, index) => ({
        id: section.id,
        type: section.name,
        isVisible: section.isVisible,
        order: index,
        enabled: section.isVisible
      }));
      localStorage.setItem(`cv_section_order_${cv.id || cv.title}`, JSON.stringify(sectionOrderData));
      if (onSectionOrderChange) {
        onSectionOrderChange(sectionOrderData);
      }
    }
  }, [cv.id, cv.title, cv.data, onSectionOrderChange]);

  // Debounced save function
  const debouncedSave = useCallback((newSections: SectionConfig[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      saveSectionOrder(newSections);
      setIsReordering(false);
      timeoutRef.current = null;
    }, 300);
  }, [saveSectionOrder]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    if (!enableDragDrop) return;

    setDraggedSection(sectionId);
    setIsReordering(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);

    // Add ghost image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, [enableDragDrop]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, sectionId: string) => {
    if (!enableDragDrop || !draggedSection) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (sectionId !== draggedSection) {
      setDragOverSection(sectionId);
    }
  }, [enableDragDrop, draggedSection]);

  // Handle drag enter
  const handleDragEnter = useCallback((e: React.DragEvent, sectionId: string) => {
    if (!enableDragDrop || !draggedSection) return;
    e.preventDefault();
    if (sectionId !== draggedSection) {
      setDragOverSection(sectionId);
    }
  }, [enableDragDrop, draggedSection]);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetSectionId: string) => {
    if (!enableDragDrop || !draggedSection) return;

    e.preventDefault();

    if (draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSection);
    const targetIndex = newSections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    // Move the dragged section
    const [movedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, movedSection);

    // Update order property
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    setSections(updatedSections);
    setDraggedSection(null);
    setDragOverSection(null);

    // Debounced save
    debouncedSave(updatedSections);
  }, [enableDragDrop, draggedSection, sections, debouncedSave]);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSection(null);
    setDragOverSection(null);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSection(null);
    }
  }, []);

  // Render section content based on section type
  const renderSectionContent = (section: SectionConfig) => {
    switch (section.id) {
      case 'personalInfo':
        return (
          <div className="space-y-3">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {cv.data.personalInfo?.fullName || 'Ad Soyad'}
              </h1>
              {cv.data.personalInfo?.title && (
                <p className="text-lg text-gray-600 mt-1">{cv.data.personalInfo.title}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
              {cv.data.personalInfo?.email && (
                <span>📧 {cv.data.personalInfo.email}</span>
              )}
              {cv.data.personalInfo?.phone && (
                <span>📱 {cv.data.personalInfo.phone}</span>
              )}
              {cv.data.personalInfo?.linkedin && (
                <span>🔗 LinkedIn</span>
              )}
            </div>
            {cv.data.personalInfo?.summary && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Özət</h3>
                <div
                  className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: cv.data.personalInfo.summary }}
                />
              </div>
            )}
          </div>
        );

      case 'experience':
        if (!cv.data.experience || cv.data.experience.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              İş Təcrübəsi
            </h3>
            {cv.data.experience.map((exp: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{exp.position}</h4>
                    <p className="text-sm text-gray-700">{exp.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exp.startDate} - {exp.current ? 'Hazırda' : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <div
                    className="text-xs text-gray-600 leading-relaxed prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: exp.description }}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'education':
        if (!cv.data.education || cv.data.education.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Təhsil
            </h3>
            {cv.data.education.map((edu: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    {edu.field && (
                      <p className="text-xs text-gray-600">{edu.field}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {edu.startDate} - {edu.current ? 'Hazırda' : edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        if (!cv.data.skills || cv.data.skills.length === 0) return null;

        const hardSkills = cv.data.skills.filter(skill => {
          if (typeof skill === 'string') return true; // String skills default to hard skills
          return skill.type === 'hard' || !skill.type;
        });
        const softSkills = cv.data.skills.filter(skill => {
          if (typeof skill === 'string') return false; // String skills are not soft skills
          return skill.type === 'soft';
        });

        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Bacarıqlar
            </h3>

            {hardSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Hard Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {hardSkills.map((skill: any, index: number) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    const skillLevel = typeof skill === 'object' ? skill.level : undefined;
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skillName}{skillLevel && ` (${skillLevel})`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {softSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill: any, index: number) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    const skillLevel = typeof skill === 'object' ? skill.level : undefined;
                    return (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {skillName}{skillLevel && ` (${skillLevel})`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      case 'projects':
        if (!cv.data.projects || cv.data.projects.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Layihələr
            </h3>
            {cv.data.projects.map((project: any, index: number) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                {project.description && (
                  <div
                    className="text-xs text-gray-600 leading-relaxed prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'certifications':
        if (!cv.data.certifications || cv.data.certifications.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Sertifikatlar
            </h3>
            {cv.data.certifications.map((cert: any, index: number) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium text-gray-900">{cert.name}</h4>
                <p className="text-sm text-gray-700">{cert.issuer}</p>
                {cert.date && (
                  <p className="text-xs text-gray-500">{cert.date}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'languages':
        if (!cv.data.languages || cv.data.languages.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Dillər
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cv.data.languages.map((lang: any, index: number) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">
                    {typeof lang === 'string' ? lang : lang.name}
                  </span>
                  {typeof lang === 'object' && lang.proficiency && (
                    <span className="text-gray-600 ml-2">({lang.proficiency})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'volunteerExperience':
        if (!cv.data.volunteerExperience || cv.data.volunteerExperience.length === 0) return null;
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Könüllü Təcrübə
            </h3>
            {cv.data.volunteerExperience.map((vol: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{vol.role}</h4>
                    <p className="text-sm text-gray-700">{vol.organization}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {vol.startDate} - {vol.current ? 'Hazırda' : vol.endDate}
                  </span>
                </div>
                {vol.description && (
                  <div
                    className="text-xs text-gray-600 leading-relaxed prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: vol.description }}
                  />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-s animate-pulse">
        <div className="p-8 space-y-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {/* Reordering indicator */}
      {isReordering && (
        <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yeniden təşkil edilir...
        </div>
      )}

      <div className="p-8 space-y-6">
        {sections.map((section) => {
          const content = renderSectionContent(section);
          if (!content) return null;

          const isDragged = draggedSection === section.id;
          const isDragOver = dragOverSection === section.id;

          return (
            <div
              key={section.id}
              draggable={enableDragDrop}
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragEnter={(e) => handleDragEnter(e, section.id)}
              onDrop={(e) => handleDrop(e, section.id)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`
                relative transition-all duration-200 ease-in-out
                ${enableDragDrop ? 'cursor-move' : 'cursor-default'}
                ${isDragged ? 'opacity-50 scale-95 rotate-1 z-10' : 'opacity-100 scale-100'}
                ${isDragOver ? 'transform translate-y-1 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg' : ''}                ${enableDragDrop ? 'hover:shadow-md' : ''}
                group
              `}
              style={{
                transform: isDragged ? 'rotate(2deg) scale(0.95)' : undefined,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {/* Drag handle indicator */}
              {enableDragDrop && (
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-gray-400 text-white p-1 rounded cursor-move">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Section content */}
              <div className="relative">
                {content}
              </div>

              {/* Drop zone indicator */}
              {isDragOver && draggedSection && draggedSection !== section.id && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">
                    Buraya burax
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions for drag and drop */}
      {enableDragDrop && (
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Bölmələri sürüyərək yeniden təşkil edin
          </div>
        </div>
      )}
    </div>
  );
}
