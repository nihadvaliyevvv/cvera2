'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/types/cv';

interface LanguagesSectionProps {
  data: (Language | string | any)[];
  onChange: (data: Language[]) => void;
}

export default function LanguagesSection({ data, onChange }: LanguagesSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize languages state with proper data normalization
  useEffect(() => {
    console.log('🔄 LanguagesSection: Incoming data:', data);

    if (Array.isArray(data)) {
      const normalizedLanguages = data.map((lang: any, index: number) => {
        // Handle different data formats (from LinkedIn import or regular CV)
        if (typeof lang === 'string') {
          return {
            id: `lang-${Date.now()}-${index}`,
            language: lang,
            level: 'Professional'
          };
        } else if (lang && typeof lang === 'object') {
          return {
            id: lang.id || `lang-${Date.now()}-${index}`,
            language: lang.language ?? '',
            level: lang.level || 'Professional'
          };
        }
        return {
          id: `lang-default-${Date.now()}-${index}`,
          language: '',
          level: 'Professional'
        };
      });

      console.log('✅ LanguagesSection: Normalized languages:', normalizedLanguages);
      setLanguages(normalizedLanguages);
    } else {
      console.log('⚠️ LanguagesSection: No valid data, setting empty array');
      setLanguages([]);
    }
  }, [data]);

  // Immediate save function - NO DEBOUNCE for critical save operations
  const saveLanguages = useCallback((newLanguages: Language[]) => {
    console.log('💾 LanguagesSection: Immediate save triggered:', newLanguages);
    setSaving(true);

    // Save ALL languages, even empty ones during editing - filtering happens later
    onChange(newLanguages);

    setTimeout(() => {
      setSaving(false);
      setLastSaved(new Date());
      console.log('✅ LanguagesSection: Save completed successfully');
    }, 200);
  }, [onChange]);

  // Sync local state with parent component - IMMEDIATE SAVE
  const updateParentData = (newLanguages: Language[]) => {
    console.log('🔄 LanguagesSection: Updating parent data:', newLanguages);
    setLanguages(newLanguages);
    saveLanguages(newLanguages);
  };

  const addLanguage = () => {
    const newLanguage: Language = {
      id: `lang-${Date.now()}-${Math.random()}`,
      language: '',
      level: 'Conversational'
    };

    const updatedLanguages = [...languages, newLanguage];
    updateParentData(updatedLanguages);
    setExpandedId(newLanguage.id);
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    console.log(`🔄 LanguagesSection: Updating language ${id}, field: ${field}, value: ${value}`);
    const updated = languages.map(lang =>
      lang.id === id ? { ...lang, [field]: value } : lang
    );

    updateParentData(updated);
  };

  const removeLanguage = (id: string) => {
    console.log(`🗑️ LanguagesSection: Removing language ${id}`);
    const updated = languages.filter(lang => lang.id !== id);
    updateParentData(updated);

    // Close expanded section if removed language was expanded
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const moveLanguage = (id: string, direction: 'up' | 'down') => {
    const index = languages.findIndex(lang => lang.id === id);

    if (direction === 'up' && index > 0) {
      const updated = [...languages];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      updateParentData(updated);
    } else if (direction === 'down' && index < languages.length - 1) {
      const updated = [...languages];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      updateParentData(updated);
    }
  };

  const levelColors = {
    Basic: 'bg-red-100 text-red-800',
    Conversational: 'bg-yellow-100 text-yellow-800',
    Professional: 'bg-blue-100 text-blue-800',
    Native: 'bg-green-100 text-green-800'
  };

  const levelLabels = {
    Basic: 'Əsas',
    Conversational: 'Danışıq',
    Professional: 'Professional',
    Native: 'Ana dili'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Dillər</h3>
          {/* Save status indicator */}
          {saving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Yadda saxlanılır...</span>
            </div>
          )}
          {lastSaved && !saving && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Yadda saxlanıldı</span>
            </div>
          )}
        </div>
        <button
          onClick={addLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Hələ heç bir dil əlavə etməmisiniz</p>
          <button
            onClick={addLanguage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk dilinizi əlavə edin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {languages.map((language) => (
            <div key={language.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500">🌐</span>
                    <h4 className="font-medium text-gray-900">
                      {language.language || 'Yeni dil'}
                    </h4>
                    {/* Add move buttons */}
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => moveLanguage(language.id, 'up')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Yuxarı köçür"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLanguage(language.id, 'down')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Aşağı köçür"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  {language.level && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${levelColors[language.level as keyof typeof levelColors]}`}>
                      {levelLabels[language.level as keyof typeof levelLabels]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === language.id ? null : language.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {expandedId === language.id ? 'Bağla' : 'Redaktə et'}
                  </button>
                  <button
                    onClick={() => removeLanguage(language.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>

              {expandedId === language.id && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={language.language || ''}
                        onChange={(e) => updateLanguage(language.id, 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Azərbaycan, İngilis, Rus, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Səviyyə <span className="text-red-500">*</span></span>
                        </span>
                      </label>
                      <select
                        value={language.level || 'Conversational'}
                        onChange={(e) => updateLanguage(language.id, 'level', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="Basic">📚 Əsas</option>
                        <option value="Conversational">💬 Danışıq</option>
                        <option value="Professional">💼 Professional</option>
                        <option value="Native">🏆 Ana dili</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Səviyyə izahı:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>Əsas:</strong> Sadə cümlələr qura bilər, əsas lüğət bilir</div>
                      <div><strong>Danışıq:</strong> Gündəlik söhbət aparır, əsas mövzuları başa düşür</div>
                      <div><strong>Professional:</strong> İş mühitində sərbəst istifadə edir</div>
                      <div><strong>Ana dili:</strong> Mükəmməl bilir, ana dili və ya ona yaxın səviyyə</div>
                    </div>
                  </div>

                </div>

              )}
            </div>
          ))}
        </div>

      )}

      {languages.length > 0 && (
        <div className="text-center">
          <button
            onClick={addLanguage}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Başqa dil əlavə edin
          </button>
        </div>
      )}

    </div>

  );
}
