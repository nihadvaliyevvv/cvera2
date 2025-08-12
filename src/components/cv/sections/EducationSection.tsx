'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function EducationSection({ data, onChange }: EducationSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: ''
    };
    onChange([...data, newEducation]);
    setExpandedId(newEducation.id);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    const updated = data.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    onChange(updated);
  };

  const removeEducation = (id: string) => {
    onChange(data.filter(edu => edu.id !== id));
  };

  const moveEducation = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(edu => edu.id === id);
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
          <h3 className="text-lg font-semibold text-gray-900">Təhsil</h3>
        </div>
        <button
          onClick={addEducation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Hələ heç bir təhsil məlumatı əlavə etməmisiniz</p>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk təhsilinizi əlavə edin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((education, index) => (
            <div key={education.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500">🎓</span>
                    <h4 className="font-medium text-gray-900">
                      {education.degree || 'Yeni təhsil'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {education.institution || 'Təhsil müəssisəsi'}
                  </p>
                  {education.field && (
                    <p className="text-xs text-gray-500 mt-1">
                      {education.field}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === education.id ? null : education.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {expandedId === education.id ? 'Bağlayın' : 'Redaktə edin'}
                  </button>
                  <button
                    onClick={() => removeEducation(education.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Silin
                  </button>
                </div>
              </div>

              {expandedId === education.id && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Təhsil müəssisəsi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={education.institution}
                        onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Universitet adı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          <span>Dərəcə <span className="text-red-500">*</span></span>
                        </span>
                      </label>
                      <select
                        value={education.degree}
                        onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="">🎓 Dərəcə seçin</option>
                        <option value="Bakalavr">🎓 Bakalavr</option>
                        <option value="Magistr">🎓 Magistr</option>
                        <option value="Doktorantura">🎓 Doktorantura</option>
                        <option value="Diploma">📜 Diploma</option>
                        <option value="Sertifikat">📋 Sertifikat</option>
                        <option value="Digər">📚 Digər</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sahə <span className="text-gray-400 text-xs">(ixtiyari)</span>
                      </label>
                      <input
                        type="text"
                        value={education.field}
                        onChange={(e) => updateEducation(education.id, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Kompüter Elmi, Biznes İdarəetməsi, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA / Qiymət <span className="text-gray-400 text-xs">(ixtiyari)</span>
                      </label>
                      <input
                        type="text"
                        value={education.gpa || ''}
                        onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="3.8/4.0, Yüksək, və s."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlama tarixi <span className="text-gray-400 text-xs">(ixtiyari)</span>
                      </label>
                      <input
                        type="month"
                        value={education.startDate}
                        onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitirmə tarixi
                      </label>
                      <input
                        type="month"
                        value={education.endDate || ''}
                        onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                        disabled={education.current}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${education.id}`}
                          checked={education.current}
                          onChange={(e) => {
                            updateEducation(education.id, 'current', e.target.checked);
                            if (e.target.checked) {
                              updateEducation(education.id, 'endDate', '');
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`current-${education.id}`} className="text-sm text-gray-700">
                          Davam edir
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir
                    </label>
                    <textarea
                      value={education.description || ''}
                      onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Əsas fənlər, nailiyyətlər, və ya digər əlavə məlumatlar..."
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
            onClick={addEducation}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            + Başqa təhsil əlavə edin
          </button>
        </div>
      )}
    </div>
  );
}
