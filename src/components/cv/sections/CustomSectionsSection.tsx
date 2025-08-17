'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface CustomSection {
  id: string;
  title: string;
  description: string;
  items: CustomSectionItem[];
}

interface CustomSectionItem {
  id: string;
  title: string;
  description: string;
}

interface CustomSectionsProps {
  data: CustomSection[];
  onChange: (data: CustomSection[]) => void;
  userTier?: string;
}

export default function CustomSectionsSection({ data, onChange, userTier = 'Free' }: CustomSectionsProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Debug məlumatları üçün console.log əlavə edək
  console.log('🔍 CustomSectionsSection Debug:', {
    componentName: 'CustomSectionsSection.tsx',
    dataLength: data.length,
    data: data,
    userTier
  });

  const addSection = () => {
    const newSection: CustomSection = {
      id: `custom-section-${Date.now()}`,
      title: '',
      description: '',
      items: []
    };
    
    const updatedData = [...data, newSection];
    
    console.log('➕ CustomSectionsSection: Yeni bölmə əlavə edildi:', {
      newSectionId: newSection.id,
      totalSections: updatedData.length
    });
    
    onChange(updatedData);
    setExpandedSectionId(newSection.id);
  };

  const updateSection = (sectionId: string, field: keyof CustomSection, value: string) => {
    const updated = data.map(section =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );
    
    console.log('✏️ CustomSectionsSection: Bölmə yeniləndi:', {
      sectionId,
      field,
      value,
      totalSections: updated.length
    });
    
    onChange(updated);
  };

  const removeSection = (sectionId: string) => {
    onChange(data.filter(section => section.id !== sectionId));
  };

  const addItemToSection = (sectionId: string) => {
    const newItem: CustomSectionItem = {
      id: `custom-item-${Date.now()}`,
      title: '',
      description: ''
    };

    const updated = data.map(section =>
      section.id === sectionId
        ? { ...section, items: [...section.items, newItem] }
        : section
    );
    onChange(updated);
    setExpandedItemId(newItem.id);
  };

  const updateItem = (sectionId: string, itemId: string, field: keyof CustomSectionItem, value: string) => {
    const updated = data.map(section =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : section
    );

    // Debug: Item update logging
    console.log('🔧 CustomSectionsSection: Element yeniləndi:', {
      sectionId,
      itemId,
      field,
      value,
      totalSections: updated.length,
      updatedSection: updated.find(s => s.id === sectionId)
    });

    onChange(updated);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const updated = data.map(section =>
      section.id === sectionId
        ? { ...section, items: section.items.filter(item => item.id !== itemId) }
        : section
    );
    onChange(updated);
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = data.findIndex(section => section.id === sectionId);
    if (direction === 'up' && index > 0) {
      const updated = [...data];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      onChange(updated);
    } else if (direction === 'down' && index < data.length - 1) {
      const updated = [...data];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      onChange(updated);
    }
  };

  const moveItem = (sectionId: string, itemId: string, direction: 'up' | 'down') => {
    const updated = data.map(section => {
      if (section.id === sectionId) {
        const itemIndex = section.items.findIndex(item => item.id === itemId);
        if (direction === 'up' && itemIndex > 0) {
          const newItems = [...section.items];
          [newItems[itemIndex], newItems[itemIndex - 1]] = [newItems[itemIndex - 1], newItems[itemIndex]];
          return { ...section, items: newItems };
        } else if (direction === 'down' && itemIndex < section.items.length - 1) {
          const newItems = [...section.items];
          [newItems[itemIndex], newItems[itemIndex + 1]] = [newItems[itemIndex + 1], newItems[itemIndex]];
          return { ...section, items: newItems };
        }
      }
      return section;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Əlavə Bölmələr</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            İstəyə görə
          </span>
        </div>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Öz Bölmələrinizi Yaradın</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            CV-nizə xüsusi bölmələr əlavə edin: hobbi, sertifikatlar, mükafatlar,
            fəaliyyət sahələri və digər məlumatlar
          </p>
          <button
            onClick={addSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk bölməni əlavə edin
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((section, sectionIndex) => (
            <div key={section.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
              {/* Section Header */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-green-700">#{sectionIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {section.title || 'Yeni Bölmə'}
                      </h3>
                    </div>

                    {/* Description - right after the title */}
                    {section.description && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 px-3 py-2 rounded-lg border-l-2 border-green-300">
                          {section.description}
                        </p>
                      </div>
                    )}

                    {/* Element count */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">
                        {section.items.length} element
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action links moved to bottom of card */}
              <div className="flex items-center justify-end gap-4 mt-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setExpandedSectionId(
                    expandedSectionId === section.id ? null : section.id
                  )}
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm cursor-pointer"
                >
                  {expandedSectionId === section.id ? 'Bağlayın' : 'Redaktə edin'}
                </button>
                <button
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-800 transition-colors text-sm cursor-pointer"
                >
                  Silin
                </button>
              </div>

              {/* Section Editing */}
              {expandedSectionId === section.id && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bölmə Başlığı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Məsələn: Hobbi və Maraqlar, Sertifikatlar, Mükafatlar..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qısa Açıqlama
                      </label>
                      <RichTextEditor
                        value={section.description}
                        onChange={(value) => updateSection(section.id, 'description', value)}
                        placeholder="Bu bölmə haqqında qısa təsvir..."
                        minHeight="80px"
                      />
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Bölmə Elementləri</h4>
                      <button
                        onClick={() => addItemToSection(section.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        + Element Əlavə Edin
                      </button>
                    </div>

                    {section.items.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">
                          Bu bölməyə hələ element əlavə edilməyib
                        </p>
                        <button
                          onClick={() => addItemToSection(section.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          İlk elementi əlavə edin
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                                  #{itemIndex + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {item.title || 'Yeni Element'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveItem(section.id, item.id, 'up')}
                                  disabled={itemIndex === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => moveItem(section.id, item.id, 'down')}
                                  disabled={itemIndex === section.items.length - 1}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                >
                                  {expandedItemId === item.id ? 'Bağlayın' : 'Redaktə edin'}
                                </button>
                                <button
                                  onClick={() => removeItem(section.id, item.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors text-sm"
                                >
                                  Silin
                                </button>
                              </div>
                            </div>

                            {expandedItemId === item.id && (
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Element Başlığı <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItem(section.id, item.id, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                                    placeholder="Element adı..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıqlama
                                  </label>
                                  <RichTextEditor
                                    value={item.description}
                                    onChange={(value) => updateItem(section.id, item.id, 'description', value)}
                                    placeholder="Bu element haqqında təfərrüatlı məlumat..."
                                    minHeight="100px"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Usage Tips */}
      {data.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">💡 İstifadə Məsləhətləri</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• <strong>Hobbi və Maraqlar:</strong> şəxsi maraqlarnızı göstərin</li>
            <li>• <strong>Sertifikatlar:</strong> əlavə sertifikat və kursları əlavə edin</li>
            <li>• <strong>Mükafatlar:</strong> aldığınız mükafat və tanınmaları qeyd edin</li>
            <li>• <strong>Əlavə Fəaliyyətlər:</strong> digər peşəkar fəaliyyətlərinizi əlavə edin</li>
          </ul>
        </div>
      )}
    </div>
  );
}
