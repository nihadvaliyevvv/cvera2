'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';

interface Skill {
  id: string;
  name: string;
  level?: string;
}

interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export default function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: ''
    };
    onChange([...data, newSkill]);
    setExpandedId(newSkill.id);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    const updated = data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    onChange(updated);
  };

  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };

  const moveSkill = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(skill => skill.id === id);
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
          <h2 className="text-xl font-semibold text-gray-900">Bacarıqlar</h2>
        </div>
        <button
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Bacarıq əlavə et
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Hələ heç bir bacarıq əlavə edilməyib.</p>
          <p className="text-sm mt-2">Başlamaq üçün "Bacarıq əlavə et" düyməsini basın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((skill, index) => (
            <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-sm text-gray-900 font-medium">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSkill(skill.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveSkill(skill.id, 'down')}
                    disabled={index === data.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === skill.id ? null : skill.id)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    {expandedId === skill.id ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expandedId === skill.id && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bacarıq adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="JavaScript, Photoshop, Project Management, və s."
                      />
                    </div>
                  </div>


                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bacarıqlar</h3>
          <p className="text-sm text-gray-700">
            Bacarıqlarınızı kateqoriyalara ayırın (məsələn: &quot;Proqramlaşdırma&quot;, &quot;Dizayn&quot;, &quot;İdarəetmə&quot;) 
            və ən vacib bacarıqlarınızı yuxarıda yerləşdirin.
          </p>
        </div>
      )}
    </div>
  );
}
