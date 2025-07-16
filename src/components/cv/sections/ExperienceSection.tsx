'use client';

import { useState } from 'react';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface ExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange([...data, newExperience]);
    setExpandedId(newExperience.id);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    const updated = data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange(updated);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
  };

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(exp => exp.id === id);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <h2 className="text-xl font-semibold text-gray-900">İş təcrübəsi</h2>
        </div>
        <button
          onClick={addExperience}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Təcrübə əlavə et
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Hələ heç bir iş təcrübəsi əlavə edilməyib.</p>
          <p className="text-sm mt-2">Başlamaq üçün "Təcrübə əlavə et" düyməsini basın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-500">
                    {experience.position} - {experience.company}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveExperience(experience.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveExperience(experience.id, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === experience.id ? null : experience.id)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === experience.id ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => removeExperience(experience.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedId === experience.id && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şirkət <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Şirkət adı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vəzifə <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.position}
                        onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Vəzifə adı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlama tarixi <span className="text-gray-400 text-xs">(ixtiyari)</span>
                      </label>
                      <input
                        type="month"
                        value={experience.startDate}
                        onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitirmə tarixi <span className="text-gray-400 text-xs">(ixtiyari)</span>
                      </label>
                      <input
                        type="month"
                        value={experience.endDate || ''}
                        onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                        disabled={experience.current}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${experience.id}`}
                        checked={experience.current}
                        onChange={(e) => {
                          updateExperience(experience.id, 'current', e.target.checked);
                          if (e.target.checked) {
                            updateExperience(experience.id, 'endDate', '');
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`current-${experience.id}`} className="text-sm text-gray-700">
                        Hal-hazırda bu işdə çalışıram
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <textarea
                      value={experience.description}
                      onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Vəzifə öhdəliklərinizi və nailiyyətlərinizi təsvir edin..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
