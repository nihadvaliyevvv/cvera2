'use client';

import { useState } from 'react';
import { CVLanguage, getLabel } from '@/lib/cvLanguage';

interface Language {
  id: string;
  language: string;
  level: string;
}

interface LanguagesSectionProps {
  data: Language[];
  onChange: (data: Language[]) => void;
  language?: CVLanguage;
}

export default function LanguagesSection({ data, onChange, language = 'azerbaijani' }: LanguagesSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addLanguage = () => {
    const newLanguage: Language = {
      id: Date.now().toString(),
      language: '',
      level: 'Conversational'
    };
    onChange([...data, newLanguage]);
    setExpandedId(newLanguage.id);
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    const updated = data.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    );
    onChange(updated);
  };

  const removeLanguage = (id: string) => {
    onChange(data.filter(lang => lang.id !== id));
  };

  const moveLanguage = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(lang => lang.id === id);
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
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <h2 className="text-xl font-semibold text-gray-900">Dillər</h2>
        </div>
        <button
          onClick={addLanguage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Dil əlavə et
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Hələ heç bir dil əlavə edilməyib.</p>
          <p className="text-sm mt-2">Başlamaq üçün "Dil əlavə et" düyməsini basın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((language, index) => (
            <div key={language.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-medium">{language.language}</span>
                  {language.language && (
                    <span className={`px-2 py-1 text-xs rounded-full ${levelColors[language.level as keyof typeof levelColors]}`}>
                      {levelLabels[language.level as keyof typeof levelLabels]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveLanguage(language.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveLanguage(language.id, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === language.id ? null : language.id)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === language.id ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => removeLanguage(language.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedId === language.id && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={language.language}
                        onChange={(e) => updateLanguage(language.id, 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Azərbaycan, İngilis, Rus, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Səviyyə <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={language.level}
                        onChange={(e) => updateLanguage(language.id, 'level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Basic">Əsas</option>
                        <option value="Conversational">Danışıq</option>
                        <option value="Professional">Professional</option>
                        <option value="Native">Ana dili</option>
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

      {data.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Məsləhət:</h4>
          <p className="text-sm text-blue-800">
            Dillərə olan ehtiyacı göstərmək üçün iş elanına uyğun dil bacarıqlarınızı vurğulayın. 
            Səviyyənizi dürüst qeyd edin - bu əməkdaşın etimadını artırır.
          </p>
        </div>
      )}
    </div>
  );
}
