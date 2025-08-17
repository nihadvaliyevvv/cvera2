'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';
import RichTextEditor from '@/components/ui/RichTextEditor';

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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">İş təcrübəsi</h3>
        </div>
        <button
          onClick={addExperience}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2v0" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Hələ heç bir iş təcrübəsi əlavə etməmisiniz</p>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk iş təcrübənizi əlavə edin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div key={experience.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500">💼</span>
                    <h4 className="font-medium text-gray-900">
                      {experience.position || 'Yeni iş təcrübəsi'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {experience.company || 'Şirkət adı'}
                  </p>
                  {experience.startDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {experience.startDate} - {experience.current ? 'Davam edir' : experience.endDate}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === experience.id ? null : experience.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {expandedId === experience.id ? 'Bağlayın' : 'Redaktə edin'}
                  </button>
                  <button
                    onClick={() => removeExperience(experience.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Silin
                  </button>
                </div>
              </div>

              {expandedId === experience.id && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getLabel('company', 'azerbaijani')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder={'Şirkət adı'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getLabel('position', 'azerbaijani')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.position}
                        onChange={(e) => updateExperience(experience.id, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder={'Vəzifə adı'}
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

                    <div className="md:col-span-2">
                      <div className="w-full">
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = !experience.current;
                            updateExperience(experience.id, 'current', newValue);
                            if (newValue) {
                              updateExperience(experience.id, 'endDate', '');
                            }
                          }}
                          className={`w-full p-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                            experience.current
                              ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                              : 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          {experience.current ? 'Davam etmir' : 'Davam edir'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <RichTextEditor
                      value={experience.description}
                      onChange={(value) => updateExperience(experience.id, 'description', value)}
                      placeholder="Vəzifə öhdəliklərinizi və nailiyyətlərinizi təsvir edin..."
                      minHeight="120px"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="text-center">
          <button
            onClick={addExperience}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Başqa iş təcrübəsi əlavə edin
          </button>
        </div>
      )}
    </div>
  );
}
