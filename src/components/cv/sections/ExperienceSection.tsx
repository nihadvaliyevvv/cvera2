'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';
import RichTextEditor from '@/components/ui/RichTextEditor';
import DateRangeInput from '@/components/cv/DateRangeInput';

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

              {/* Action links moved to bottom of card */}
              <div className="flex items-center justify-end gap-4 mt-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setExpandedId(expandedId === experience.id ? null : experience.id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm cursor-pointer"
                >
                  {expandedId === experience.id ? 'Bağlayın' : 'Redaktə edin'}
                </button>
                <button
                  onClick={() => removeExperience(experience.id)}
                  className="text-red-600 hover:text-red-800 transition-colors text-sm cursor-pointer"
                >
                  Silin
                </button>
              </div>
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
