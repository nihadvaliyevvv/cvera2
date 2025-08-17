'use client';

import { useState } from 'react';
import { getLabel } from '@/lib/cvLanguage';
import RichTextEditor from '@/components/ui/RichTextEditor';
import DateRangeInput from '@/components/cv/DateRangeInput';

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
}

interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
  
}

export default function ProjectsSection({ data, onChange }: ProjectsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
      current: false
    };
    onChange([...data, newProject]);
    setExpandedId(newProject.id);
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[] | boolean) => {
    const updated = data.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    );
    onChange(updated);
  };

  const removeProject = (id: string) => {
    onChange(data.filter(project => project.id !== id));
  };

  const moveProject = (id: string, direction: 'up' | 'down') => {
    const index = data.findIndex(project => project.id === id);
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

  const updateTechnologies = (id: string, techString: string) => {
    const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech);
    updateProject(id, 'technologies', technologies);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Layihələr</h3>
        </div>
        <button
          onClick={addProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Əlavə edin
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Hələ heç bir layihə əlavə etməmisiniz</p>
          <button
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            İlk layihənizi əlavə edin
            </button>

        </div>
      ) : (
        <div className="space-y-4">
          {data.map((project, index) => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500">🚀</span>
                  <h4 className="font-medium text-gray-900">
                    {project.name || 'Yeni layihə'}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {project.description || 'Layihə təsviri'}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="text-xs text-gray-500">+{project.technologies.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action links moved to bottom of card */}
              <div className="flex items-center justify-end gap-4 mt-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm cursor-pointer"
                >
                  {expandedId === project.id ? 'Bağlayın' : 'Redaktə edin'}
                </button>
                <button
                  onClick={() => removeProject(project.id)}
                  className="text-red-600 hover:text-red-800 transition-colors text-sm cursor-pointer"
                >
                  Silin
                </button>
              </div>

              {expandedId === project.id && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layihə adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Layihənin adı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layihə URL-i
                      </label>
                      <input
                        type="url"
                        value={project.url || ''}
                        onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="https://github.com/username/project"
                      />
                    </div>

                    {/* Professional Date Range Input */}
                    <DateRangeInput
                      startDate={project.startDate || ''}
                      endDate={project.endDate}
                      current={project.current || false}
                      onStartDateChange={(date) => updateProject(project.id, 'startDate', date)}
                      onEndDateChange={(date) => updateProject(project.id, 'endDate', date)}
                      onCurrentChange={(current) => updateProject(project.id, 'current', current)}
                      startLabel="Başlama tarixi"
                      endLabel="Bitirmə tarixi"
                      currentLabel="Layihə davam edir"
                      required={true}
                    />

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texnologiyalar
                    </label>
                    <input
                      type="text"
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateTechnologies(project.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="React, Node.js, PostgreSQL, AWS (vergüllə ayırın)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Texnologiyaları vergüllə ayırın
                    </p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Təsvir <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                      value={project.description}
                      onChange={(value) => updateProject(project.id, 'description', value)}
                      placeholder="Layihənin məqsədini, istifadə olunan texnologiyaları və əldə olunan nəticələri təsvir edin..."
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
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Layihələr</h3>
          <p className="text-sm text-gray-700">
            Layihələrinizi business nəticələri ilə təsvir edin. Məsələn: "Satış artım 25% artırıldı" və ya
            "İstifadəçi engagement 40% yüksəldi". GitHub linkləri və ya demo linkləri əlavə etməyi unutmayın.
          </p>
        </div>
      )}

      {data.length > 0 && (
          <div className="text-center">
            <button
                onClick={addProject}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Başqa layihə əlavə edin
            </button>
          </div>
      )}
    </div>
  );
}
