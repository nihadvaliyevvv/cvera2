'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CVLanguage, getLabel } from '@/lib/cvLanguage';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: any;
    experience?: any[];
    education?: any[];
    skills?: any[];
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

  // Auto-save section order changes
  const saveSectionOrder = async (newSections: SectionConfig[]) => {
    try {
      if (!cv.id) return;

      const sectionOrderData = newSections.map((section, index) => ({
        id: section.id,
        type: section.name,
        isVisible: section.isVisible,
        order: index,
        enabled: section.isVisible
      }));

      console.log('💾 Section order saxlanılır:', sectionOrderData);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ Token tapılmadı');
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

        // Notify parent component
        if (onSectionOrderChange) {
          onSectionOrderChange(sectionOrderData);
        }
      } else {
        console.error('❌ Section order saxlanılmadı:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Section order save error:', error);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    if (!enableDragDrop) return;

    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', sectionId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    if (!enableDragDrop || !draggedSection) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetSectionId: string) => {
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

    if (draggedIndex === -1 || targetIndex === -1) return;

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

    // Auto-save the new order
    await saveSectionOrder(updatedSections);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverSection(null);
  };

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
                <p className="text-sm text-gray-700 leading-relaxed">
                  {cv.data.personalInfo.summary}
                </p>
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
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {exp.description}
                  </p>
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
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 border-b border-gray-300 pb-1">
              Bacarıqlar
            </h3>
            <div className="flex flex-wrap gap-2">
              {cv.data.skills.map((skill: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {typeof skill === 'string' ? skill : skill.name}
                </span>
              ))}
            </div>
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
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
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
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {vol.description}
                  </p>
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
      <div className="w-full h-full bg-white animate-pulse">
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
    <div className="w-full h-full bg-white">
      <div className="p-8 space-y-6">
        {sections.map((section) => {
          const content = renderSectionContent(section);
          if (!content) return null;

          return (
            <div
              key={section.id}
              draggable={enableDragDrop}
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`relative group transition-all duration-200 ${
                enableDragDrop ? 'cursor-move' : ''
              } ${
                draggedSection === section.id
                  ? 'opacity-50 transform scale-105'
                  : ''
              } ${
                dragOverSection === section.id && draggedSection !== section.id
                  ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50'
                  : ''
              }`}
              style={{
                userSelect: enableDragDrop ? 'none' : 'text',
                WebkitUserSelect: enableDragDrop ? 'none' : 'text'
              }}
            >
              {/* Drag indicator - only show when drag is enabled */}
              {enableDragDrop && (
                <div className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-center w-4 h-full">
                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4h2v2H4V4zm0 5h2v2H4V9zm0 5h2v2H4v-2zm5-10h2v2H9V4zm0 5h2v2H9V9zm0 5h2v2H9v-2zm5-10h2v2h-2V4zm0 5h2v2h-2V9zm0 5h2v2h-2v-2z"/>
                    </svg>
                  </div>
                </div>
              )}

              {/* Section content */}
              <div className="relative z-10">
                {content}
              </div>

              {/* Drop indicator */}
              {dragOverSection === section.id && draggedSection !== section.id && (
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none"></div>
              )}
            </div>
          );
        })}

        {/* Drag and drop instructions */}
        {enableDragDrop && sections.length > 1 && (
          <div className="mt-8 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4h2v2H4V4zm0 5h2v2H4V9zm0 5h2v2H4v-2zm5-10h2v2H9V4zm0 5h2v2H9V9zm0 5h2v2H9v-2zm5-10h2v2h-2V4zm0 5h2v2h-2V9zm0 5h2v2h-2v-2z"/>
              </svg>
              <span>Bölmələri sürükləyərək yenidən sıralayın</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
