'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SectionStyle {
  width: number;
  height: number;
  fontSize: number;
  padding: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
}

interface CVSection {
  id: string;
  type: string;
  title: string;
  content: any;
  style: SectionStyle;
  order: number;
  isVisible: boolean;
}

interface NativeSectionEditorProps {
  sections: CVSection[];
  onSectionsChange: (sections: CVSection[]) => void;
  gridSize?: number;
  minSectionWidth?: number;
  minSectionHeight?: number;
  maxSectionWidth?: number;
  maxSectionHeight?: number;
}

const DEFAULT_STYLE: SectionStyle = {
  width: 100,
  height: 200,
  fontSize: 14,
  padding: 16,
  fontWeight: 'normal',
  fontFamily: 'Inter, system-ui, sans-serif',
  lineHeight: 1.5,
  letterSpacing: 0,
  backgroundColor: '#ffffff',
  textColor: '#374151',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e5e7eb'
};

export default function NativeSectionEditor({
  sections,
  onSectionsChange,
  gridSize = 8,
  minSectionWidth = 200,
  minSectionHeight = 100,
  maxSectionWidth = 800,
  maxSectionHeight = 600
}: NativeSectionEditorProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Handle native drag start
  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  }, []);

  // Handle native drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle native drop
  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();

    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      return;
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedSection(null);
      return;
    }

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedItem);

    // Update order property
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    onSectionsChange(updatedSections);
    setDraggedSection(null);
  }, [draggedSection, sections, onSectionsChange]);

  // Update section style property
  const updateSectionStyle = useCallback((sectionId: string, property: keyof SectionStyle, value: any) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            style: {
              ...section.style,
              [property]: value
            }
          }
        : section
    );

    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  // Toggle section visibility
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, isVisible: !section.isVisible }
        : section
    );

    onSectionsChange(updatedSections);
  }, [sections, onSectionsChange]);

  // Render style panel
  const renderStylePanel = () => {
    if (!selectedSection) return null;

    const section = sections.find(s => s.id === selectedSection);
    if (!section) return null;

    return (
      <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Style Panel</h3>
          <button
            onClick={() => setShowStylePanel(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close style panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section: {section.title}</label>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <input
              type="range"
              min="8"
              max="24"
              value={section.style.fontSize}
              onChange={(e) => updateSectionStyle(section.id, 'fontSize', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8px</span>
              <span>{section.style.fontSize}px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={section.style.textColor}
                onChange={(e) => updateSectionStyle(section.id, 'textColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <input
                type="color"
                value={section.style.backgroundColor}
                onChange={(e) => updateSectionStyle(section.id, 'backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Visible</label>
            <button
              onClick={() => toggleSectionVisibility(section.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                section.isVisible ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              aria-label={`Toggle ${section.title} visibility`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  section.isVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-50 p-4">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Visual Section Editor</h2>
          <span className="text-sm text-gray-500">
            {sections.filter(s => s.isVisible).length} of {sections.length} sections visible
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStylePanel(!showStylePanel)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showStylePanel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Style Panel
          </button>

          <div className="text-xs text-gray-500">
            Grid: {gridSize}px
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="space-y-4 min-h-96">
        {sections.map((section) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, section.id)}
            className={`relative group transition-all duration-200 ${
              draggedSection === section.id ? 'opacity-50 transform rotate-1 scale-105' : ''
            } ${!section.isVisible ? 'opacity-50' : ''}`}
            style={{
              width: `${section.style.width}%`,
              minHeight: `${section.style.height}px`
            }}
            onClick={() => {
              setSelectedSection(section.id);
              setShowStylePanel(true);
            }}
          >
            {/* Section content */}
            <div
              className="w-full h-full relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-move"
              style={{
                backgroundColor: section.style.backgroundColor,
                color: section.style.textColor,
                fontSize: `${section.style.fontSize}px`,
                fontFamily: section.style.fontFamily,
                fontWeight: section.style.fontWeight,
                lineHeight: section.style.lineHeight,
                letterSpacing: `${section.style.letterSpacing}px`,
                padding: `${section.style.padding}px`,
                borderRadius: `${section.style.borderRadius}px`,
                borderWidth: `${section.style.borderWidth}px`,
                borderColor: section.style.borderColor,
                borderStyle: 'solid'
              }}
            >
              {/* Drag indicator */}
              <div className="absolute top-2 left-2 p-1 bg-gray-800 bg-opacity-75 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              {/* Section title and content */}
              <div className="h-full flex flex-col">
                <h3 className="font-semibold mb-2 text-lg">{section.title}</h3>
                <div className="flex-1 overflow-hidden">
                  {typeof section.content === 'string' ? (
                    <p className="text-sm leading-relaxed">{section.content}</p>
                  ) : (
                    <div className="text-sm leading-relaxed">
                      {Array.isArray(section.content) ?
                        `${section.content.length} items` :
                        'Section content'
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Visibility indicator */}
              {!section.isVisible && (
                <div className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded text-xs">
                  Hidden
                </div>
              )}

              {/* Selection indicator */}
              {selectedSection === section.id && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Style panel */}
      {showStylePanel && renderStylePanel()}

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600 max-w-xs">
        <div className="font-medium mb-1">How to use:</div>
        <div>• Drag sections to reorder</div>
        <div>• Click to select and style</div>
        <div>• Use style panel for customization</div>
      </div>
    </div>
  );
}
