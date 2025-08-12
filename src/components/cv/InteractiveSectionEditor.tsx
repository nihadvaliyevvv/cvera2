'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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

interface InteractiveSectionEditorProps {
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

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' }
];

export default function InteractiveSectionEditor({
  sections,
  onSectionsChange,
  gridSize = 8,
  minSectionWidth = 200,
  minSectionHeight = 100,
  maxSectionWidth = 800,
  maxSectionHeight = 600
}: InteractiveSectionEditorProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<{
    sectionId: string;
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  } | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
  } | null>(null);

  // Snap to grid utility
  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  // Handle drag end for reordering sections
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const reorderedSections = Array.from(sections);
    const [removed] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, removed);

    // Update order property
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index
    }));

    onSectionsChange(updatedSections);
    setIsDragging(false);
  }, [sections, onSectionsChange]);

  // Handle resize start
  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    sectionId: string,
    handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsResizing({ sectionId, handle });
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: section.style.width,
      height: section.style.height
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', handleResizeEnd);
  }, [sections]);

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartRef.current) return;

    const { sectionId, handle } = isResizing;
    const { mouseX, mouseY, width, height } = resizeStartRef.current;

    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;

    let newWidth = width;
    let newHeight = height;

    // Calculate new dimensions based on resize handle
    if (handle.includes('e')) newWidth = width + deltaX;
    if (handle.includes('w')) newWidth = width - deltaX;
    if (handle.includes('s')) newHeight = height + deltaY;
    if (handle.includes('n')) newHeight = height - deltaY;

    // Snap to grid and apply constraints
    newWidth = snapToGrid(Math.max(minSectionWidth, Math.min(maxSectionWidth, newWidth)));
    newHeight = snapToGrid(Math.max(minSectionHeight, Math.min(maxSectionHeight, newHeight)));

    // Update section style
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            style: {
              ...section.style,
              width: newWidth,
              height: newHeight
            }
          }
        : section
    );

    onSectionsChange(updatedSections);
  }, [isResizing, sections, onSectionsChange, snapToGrid, minSectionWidth, minSectionHeight, maxSectionWidth, maxSectionHeight]);

  // Handle touch resize move
  const handleResizeTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!isResizing || !resizeStartRef.current) return;

    const touch = e.touches[0];
    const { sectionId, handle } = isResizing;
    const { mouseX, mouseY, width, height } = resizeStartRef.current;

    const deltaX = touch.clientX - mouseX;
    const deltaY = touch.clientY - mouseY;

    let newWidth = width;
    let newHeight = height;

    if (handle.includes('e')) newWidth = width + deltaX;
    if (handle.includes('w')) newWidth = width - deltaX;
    if (handle.includes('s')) newHeight = height + deltaY;
    if (handle.includes('n')) newHeight = height - deltaY;

    newWidth = snapToGrid(Math.max(minSectionWidth, Math.min(maxSectionWidth, newWidth)));
    newHeight = snapToGrid(Math.max(minSectionHeight, Math.min(maxSectionHeight, newHeight)));

    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            style: {
              ...section.style,
              width: newWidth,
              height: newHeight
            }
          }
        : section
    );

    onSectionsChange(updatedSections);
  }, [isResizing, sections, onSectionsChange, snapToGrid, minSectionWidth, minSectionHeight, maxSectionWidth, maxSectionHeight]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    resizeStartRef.current = null;

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchmove', handleResizeTouchMove);
    document.removeEventListener('touchend', handleResizeEnd);
  }, [handleResizeMove, handleResizeTouchMove]);

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

  // Render resize handles
  const renderResizeHandles = (sectionId: string) => (
    <>
      {/* Corner handles */}
      <div
        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'nw')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'nw')}
        aria-label="Resize northwest"
      />
      <div
        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'ne')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'ne')}
        aria-label="Resize northeast"
      />
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'sw')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'sw')}
        aria-label="Resize southwest"
      />
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'se')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'se')}
        aria-label="Resize southeast"
      />

      {/* Edge handles */}
      <div
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-blue-500 border border-white rounded cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'n')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'n')}
        aria-label="Resize north"
      />
      <div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-blue-500 border border-white rounded cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 's')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 's')}
        aria-label="Resize south"
      />
      <div
        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-6 bg-blue-500 border border-white rounded cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'w')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'w')}
        aria-label="Resize west"
      />
      <div
        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-6 bg-blue-500 border border-white rounded cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, sectionId, 'e')}
        onTouchStart={(e) => handleResizeStart(e.nativeEvent.touches[0] as any, sectionId, 'e')}
        aria-label="Resize east"
      />
    </>
  );

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
          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section: {section.title}</label>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <input
                type="number"
                value={section.style.width}
                onChange={(e) => updateSectionStyle(section.id, 'width', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={minSectionWidth}
                max={maxSectionWidth}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="number"
                value={section.style.height}
                onChange={(e) => updateSectionStyle(section.id, 'height', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={minSectionHeight}
                max={maxSectionHeight}
              />
            </div>
          </div>

          {/* Typography */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              value={section.style.fontFamily}
              onChange={(e) => updateSectionStyle(section.id, 'fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {FONT_FAMILIES.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
            <select
              value={section.style.fontWeight}
              onChange={(e) => updateSectionStyle(section.id, 'fontWeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="semibold">Semibold</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          {/* Spacing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
            <input
              type="range"
              min="0"
              max="32"
              value={section.style.padding}
              onChange={(e) => updateSectionStyle(section.id, 'padding', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>{section.style.padding}px</span>
              <span>32px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Line Height</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={section.style.lineHeight}
              onChange={(e) => updateSectionStyle(section.id, 'lineHeight', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0</span>
              <span>{section.style.lineHeight}</span>
              <span>3.0</span>
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

          {/* Border */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
            <input
              type="range"
              min="0"
              max="8"
              value={section.style.borderWidth}
              onChange={(e) => updateSectionStyle(section.id, 'borderWidth', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>{section.style.borderWidth}px</span>
              <span>8px</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
            <input
              type="color"
              value={section.style.borderColor}
              onChange={(e) => updateSectionStyle(section.id, 'borderColor', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={section.style.borderRadius}
              onChange={(e) => updateSectionStyle(section.id, 'borderRadius', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0px</span>
              <span>{section.style.borderRadius}px</span>
              <span>24px</span>
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
    <div className="relative w-full h-full bg-gray-50 p-4" ref={containerRef}>
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
          <h2 className="text-lg font-semibold text-gray-900">Interactive Section Editor</h2>
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" direction="vertical">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 min-h-96 ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              } transition-colors duration-200`}
            >
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                  isDragDisabled={!!isResizing}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative group transition-all duration-200 ${
                        snapshot.isDragging ? 'z-50 rotate-1 scale-105' : ''
                      } ${!section.isVisible ? 'opacity-50' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        width: `${section.style.width}px`,
                        height: `${section.style.height}px`
                      }}
                      onClick={() => {
                        setSelectedSection(section.id);
                        setShowStylePanel(true);
                      }}
                    >
                      {/* Section content */}
                      <div
                        className="w-full h-full relative overflow-hidden transition-all duration-200 hover:shadow-lg"
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
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 p-1 bg-gray-800 bg-opacity-75 text-white rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          aria-label={`Drag ${section.title}`}
                        >
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
                                {JSON.stringify(section.content, null, 2)}
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

                      {/* Resize handles */}
                      {selectedSection === section.id && renderResizeHandles(section.id)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Style panel */}
      {showStylePanel && renderStylePanel()}

      {/* Keyboard shortcuts info */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600 max-w-xs">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div>• Click section to select</div>
        <div>• Drag handles to resize</div>
        <div>• Drag icon to reorder</div>
        <div>• Style panel for fine-tuning</div>
      </div>
    </div>
  );
}
