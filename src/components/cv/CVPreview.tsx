'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import CVExportButtons from './CVExportButtons';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      website?: string;
      linkedin?: string;
      github?: string;
      summary?: string;
      profileImage?: string;
      profilePicture?: string;
    };
    experience: Array<{
      id: string;
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
      location?: string;
    }>;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      gpa?: string;
      description?: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      category?: string;
      level?: string;
    }>;
    languages: Array<{
      id: string;
      name: string;
      level: 'Basic' | 'Conversational' | 'Professional' | 'Native';
    }>;
    projects: Array<{
      id: string;
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      github?: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      credentialId?: string;
      url?: string;
    }>;
    volunteerExperience?: Array<{
      id: string;
      organization: string;
      role: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description?: string;
      cause?: string;
    }>;
    publications?: Array<{
      id: string;
      title: string;
      description?: string;
      url?: string;
      date?: string;
      publisher?: string;
      authors?: string[];
    }>;
    honorsAwards?: Array<{
      id: string;
      title: string;
      description?: string;
      date?: string;
      issuer?: string;
      url?: string;
    }>;
    testScores?: Array<{
      id: string;
      testName: string;
      score: string;
      date?: string;
      description?: string;
    }>;
    recommendations?: Array<{
      id: string;
      recommenderName: string;
      recommenderTitle?: string;
      recommenderCompany?: string;
      text: string;
      date?: string;
    }>;
    courses?: Array<{
      id: string;
      name: string;
      institution: string;
      description?: string;
      completionDate?: string;
      certificate?: boolean;
      url?: string;
    }>;
  };
}

interface Template {
  id: string;
  name: string;
  tier: 'Free' | 'Medium' | 'Premium';
  preview_url: string;
}

interface CVPreviewProps {
  cv: CVData;
}

export default function CVPreview({ cv }: CVPreviewProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.get('/api/templates');
      const templates = result.data;
      const foundTemplate = templates.find((t: Template) => t.id === cv.templateId);
      setTemplate(foundTemplate || null);
    } catch (err) {
      console.error('Template yüklənərkən xəta:', err);
    } finally {
      setLoading(false);
    }
  }, [cv.templateId]);

  useEffect(() => {
    if (cv.templateId) {
      loadTemplate();
    }
  }, [cv.templateId, loadTemplate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' });
  };

  const formatDateRange = (startDate: string, endDate?: string, current?: boolean) => {
    const start = formatDate(startDate);
    if (current) {
      return `${start} - İndiyə qədər`;
    }
    if (endDate) {
      return `${start} - ${formatDate(endDate)}`;
    }
    return start;
  };

  const languageLevelWidth = (level: string) => {
    switch (level) {
      case 'Basic': return '25%';
      case 'Conversational': return '50%';
      case 'Professional': return '75%';
      case 'Native': return '100%';
      default: return '50%';
    }
  };

  const cvElementId = `cv-preview-${cv.id || 'current'}`;
  const fileName = cv.data.personalInfo.name || 'CV';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">CV Önizləmə</h3>
          {template && (
            <span className="text-xs text-gray-500">
              Şablon: {template.name}
            </span>
          )}
        </div>

        {/* Export Buttons */}
        <div className="mt-3">
          <CVExportButtons
            cvData={cv.data}
            cvElementId={cvElementId}
            fileName={fileName}
          />
        </div>
      </div>

      {/* Scrollable preview wrapper */}
      <div className="max-h-96 overflow-y-auto">
        <div id={cvElementId} className="p-6 bg-white">
          {/* Personal Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {cv.data.personalInfo.name || 'Ad və Soyad'}
            </h1>
            <div className="space-y-1 text-sm text-gray-600">
              {cv.data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>{cv.data.personalInfo.email}</span>
                </div>
              )}
              {cv.data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{cv.data.personalInfo.phone}</span>
                </div>
              )}
              {cv.data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{cv.data.personalInfo.location}</span>
                </div>
              )}
              {cv.data.personalInfo.website && (
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <a href={cv.data.personalInfo.website} className="text-blue-600 hover:underline">
                    {cv.data.personalInfo.website}
                  </a>
                </div>
              )}
              {cv.data.personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <span>💼</span>
                  <a href={cv.data.personalInfo.linkedin} className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
            {cv.data.personalInfo.summary && (
              <p className="mt-3 text-sm text-gray-700">{cv.data.personalInfo.summary}</p>
            )}
          </div>

          {/* Experience */}
          {cv.data.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                İş Təcrübəsi
              </h2>
              <div className="space-y-4">
                {cv.data.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-medium text-gray-900">{exp.position}</h3>
                    <div className="text-sm text-gray-600 mb-1">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {cv.data.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Təhsil
              </h2>
              <div className="space-y-4">
                {cv.data.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-green-200 pl-4">
                    <h3 className="font-medium text-gray-900">{edu.degree} - {edu.field}</h3>
                    <div className="text-sm text-gray-600 mb-1">{edu.institution}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-700">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {cv.data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Bacarıqlar
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cv.data.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cv.data.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Dillər
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {cv.data.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                        <span className="text-xs text-gray-500">{lang.level}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: languageLevelWidth(lang.level) }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cv.data.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Layihələr
              </h2>
              <div className="space-y-4">
                {cv.data.projects.map((project) => (
                  <div key={project.id} className="border-l-2 border-purple-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Görüntülə
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDateRange(project.startDate, project.endDate, project.current)}
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cv.data.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Sertifikatlar
              </h2>
              <div className="space-y-4">
                {cv.data.certifications.map((cert) => (
                  <div key={cert.id} className="border-l-2 border-yellow-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Görüntülə
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{cert.issuer}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(cert.issueDate)}
                      {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                      {cert.credentialId && ` • ID: ${cert.credentialId}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteer Experience */}
          {cv.data.volunteerExperience && cv.data.volunteerExperience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Könüllü Təcrübəsi
              </h2>
              <div className="space-y-4">
                {cv.data.volunteerExperience.map((vol) => (
                  <div key={vol.id} className="border-l-2 border-red-200 pl-4">
                    <h3 className="font-medium text-gray-900">{vol.role}</h3>
                    <div className="text-sm text-gray-600 mb-1">
                      {vol.organization}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {formatDateRange(vol.startDate, vol.endDate, vol.current)}
                    </div>
                    {vol.description && (
                      <p className="text-sm text-gray-700">{vol.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other sections would go here similarly... */}
        </div>
      </div>
    </div>
  );
}
