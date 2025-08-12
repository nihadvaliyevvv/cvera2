'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';

interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  cause?: string;
}

interface VolunteerExperienceSectionProps {
  data: VolunteerExperience[];
  onChange: (data: VolunteerExperience[]) => void;
  
}

export default function VolunteerExperienceSection({ data, onChange }: VolunteerExperienceSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addVolunteerExperience = () => {
    const newVolunteerExperience: VolunteerExperience = {
      id: generateId(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      cause: ''
    };
    onChange([...data, newVolunteerExperience]);
    setEditingIndex(data.length);
  };

  const updateVolunteerExperience = (index: number, field: keyof VolunteerExperience, value: string | boolean) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    
    // If marked as current, clear end date
    if (field === 'current' && value === true) {
      updated[index].endDate = '';
    }
    
    onChange(updated);
  };

  const removeVolunteerExperience = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Könüllü təcrübə</h3>
        </div>
        <button
          onClick={addVolunteerExperience}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Hələ heç bir könüllü təcrübə əlavə etməmisiniz</p>
          <button
            onClick={addVolunteerExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk könüllü təcrübəni əlavə edin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((volunteer, index) => (
            <div key={volunteer.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500">❤️</span>
                    <h4 className="font-medium text-gray-900">
                      {volunteer.role || 'Yeni könüllü təcrübə'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {volunteer.organization || 'Təşkilat adı'}
                  </p>
                  {volunteer.cause && (
                    <p className="text-xs text-gray-500 mt-1">
                      {volunteer.cause}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {editingIndex === index ? 'Bağlayın' : 'Redaktə edin'}
                  </button>
                  <button
                    onClick={() => removeVolunteerExperience(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Silin
                  </button>
                </div>
              </div>

              {editingIndex === index && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vəzifə/Rol
                      </label>
                      <input
                        type="text"
                        value={volunteer.role}
                        onChange={(e) => updateVolunteerExperience(index, 'role', e.target.value)}
                        placeholder="Könüllü koordinator"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Təşkilat
                      </label>
                      <input
                        type="text"
                        value={volunteer.organization}
                        onChange={(e) => updateVolunteerExperience(index, 'organization', e.target.value)}
                        placeholder="Kinder MTM"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sahə/Məqsəd (ixtiyari)
                    </label>
                    <input
                      type="text"
                      value={volunteer.cause || ''}
                      onChange={(e) => updateVolunteerExperience(index, 'cause', e.target.value)}
                      placeholder="Uşaq təhsili, ekoloji mühafizə, sosial yardım"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlama tarixi
                      </label>
                      <input
                        type="month"
                        value={volunteer.startDate}
                        onChange={(e) => updateVolunteerExperience(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bitirmə tarixi (ixtiyari)
                      </label>
                      <input
                        type="month"
                        value={volunteer.endDate || ''}
                        onChange={(e) => updateVolunteerExperience(index, 'endDate', e.target.value)}
                        disabled={volunteer.current}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={volunteer.current}
                          onChange={(e) => updateVolunteerExperience(index, 'current', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Hələ də davam edir</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Təsvir (ixtiyari)
                    </label>
                    <textarea
                      value={volunteer.description}
                      onChange={(e) => updateVolunteerExperience(index, 'description', e.target.value)}
                      rows={3}
                      placeholder="Könüllü fəaliyyətiniz haqqında qısa məlumat verin..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
            onClick={addVolunteerExperience}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Başqa könüllü təcrübə əlavə edin
          </button>
        </div>
      )}
    </div>
  );
}
