'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import CVExportButtons from './CVExportButtons';
import CVPreviewMedium from './CVPreviewMedium';

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
    customSections?: Array<{
      id: string;
      title: string;
      description?: string;
      type?: 'simple' | 'detailed' | 'timeline';
      isVisible?: boolean;
      priority?: number;
      items?: Array<{
        id: string;
        title: string;
        description?: string;
        date?: string;
        location?: string;
        url?: string;
      }>;
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

  // Debug: Custom sections məlumatını console-da göstər
  console.log('🔍 CVPreview Debug:', {
    componentName: 'CVPreview.tsx',
    templateId: cv.templateId,
    templateIdType: typeof cv.templateId,
    isModernCentered: cv.templateId === 'modern-centered',
    templateFound: template?.name || 'Not loaded yet',
    allTemplateData: { template },
    customSections: cv.data.customSections,
    customSectionsLength: cv.data.customSections?.length || 0,
    hasItems: cv.data.customSections?.some(section => section.items && section.items.length > 0),
    visibleSections: cv.data.customSections?.filter(section => section.isVisible !== false) || []
  });

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

  // If template is medium, use the specialized component
  if (cv.templateId === 'medium') {
    console.log('🎨 Using CVPreviewMedium component');
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
              cvElementId={`cv-preview-${cv.id || 'current'}`}
              fileName={cv.data.personalInfo.name || 'CV'}
            />
          </div>
        </div>

        {/* Use the CVPreviewMedium component */}
        <div className="max-h-96 overflow-y-auto">
          <div id={`cv-preview-${cv.id || 'current'}`}>
            <CVPreviewMedium cv={cv} />
          </div>
        </div>
      </div>
    );
  }

  // If template is traditional (Ənənəvi CV), use the specialized traditional layout
  if (cv.templateId === 'traditional' ||
      cv.templateId === '8b26fb4c-7ec1-4c0d-bbd9-4b597fb1df45' ||
      (template && template.name === 'Ənənəvi CV') ||
      (template && template.name?.includes('Ənənəvi')) ||
      cv.templateId?.includes('traditional')) {
    console.log('🎨 Using Traditional CV component');
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
              cvElementId={`cv-preview-${cv.id || 'current'}`}
              fileName={cv.data.personalInfo.name || 'CV'}
              templateId="traditional"
            />
          </div>
        </div>

        {/* Traditional CV Layout - Full A4 Preview */}
        <div className="overflow-y-auto" style={{ maxHeight: '800px' }}>
          <div id={`cv-preview-${cv.id || 'current'}`} className="bg-white">
            {/* Traditional CV Template with Sidebar Layout */}
            <div className="flex min-h-[1000px]" style={{ fontFamily: 'Inter, sans-serif' }}>

              {/* Left Sidebar - Dark Blue */}
              <div className="w-1/3 bg-[#0d2438] text-white p-8">
                <div className="flex flex-col items-center">

                  {/* Profile Image */}
                  {cv.data.personalInfo.profileImage || cv.data.personalInfo.profilePicture ? (
                    <img
                      src={cv.data.personalInfo.profileImage || cv.data.personalInfo.profilePicture}
                      alt="Profil Şəkli"
                      className="rounded-full w-36 h-36 border-4 border-gray-400 object-cover mb-8"
                    />
                  ) : (
                    <div className="rounded-full w-36 h-36 border-4 border-gray-400 bg-gray-300 flex items-center justify-center mb-8">
                      <span className="text-gray-600 text-sm">Şəkil</span>
                    </div>
                  )}

                  {/* Contact Section */}
                  <div className="w-full mb-8">
                    <h2 className="text-xl font-bold tracking-wider uppercase mb-4">Əlaqə</h2>
                    <div className="border-b-2 border-gray-500 w-12 mb-4"></div>
                    <div className="space-y-3 text-sm">
                      {cv.data.personalInfo.phone && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{cv.data.personalInfo.phone}</span>
                        </div>
                      )}
                      {cv.data.personalInfo.email && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{cv.data.personalInfo.email}</span>
                        </div>
                      )}
                      {cv.data.personalInfo.location && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{cv.data.personalInfo.location}</span>
                        </div>
                      )}
                      {cv.data.personalInfo.website && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                          </svg>
                          <span>{cv.data.personalInfo.website}</span>
                        </div>
                      )}
                      {cv.data.personalInfo.linkedin && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
                          </svg>
                          <span>{cv.data.personalInfo.linkedin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section in Sidebar */}
                  {cv.data.education.length > 0 && (
                    <div className="w-full mb-8">
                      <h2 className="text-xl font-bold tracking-wider uppercase mb-4">Təhsil</h2>
                      <div className="border-b-2 border-gray-500 w-12 mb-4"></div>
                      <div className="space-y-4">
                        {cv.data.education.map((edu) => (
                          <div key={edu.id}>
                            <h3 className="font-semibold">{edu.degree}</h3>
                            <p className="text-sm text-gray-300">{edu.institution} | {formatDateRange(edu.startDate, edu.endDate, edu.current)}</p>
                            {edu.gpa && <p className="text-sm text-gray-300">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Section in Sidebar */}
                  {cv.data.skills.length > 0 && (
                    <div className="w-full mb-8">
                      <h2 className="text-xl font-bold tracking-wider uppercase mb-4">Bacarıqlar</h2>
                      <div className="border-b-2 border-gray-500 w-12 mb-4"></div>
                      <ul className="space-y-2 text-sm list-disc list-inside">
                        {cv.data.skills.map((skill) => (
                          <li key={skill.id}>{skill.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Languages Section in Sidebar */}
                  {cv.data.languages.length > 0 && (
                    <div className="w-full mb-8">
                      <h2 className="text-xl font-bold tracking-wider uppercase mb-4">Dillər</h2>
                      <div className="border-b-2 border-gray-500 w-12 mb-4"></div>
                      <ul className="space-y-2 text-sm list-disc list-inside">
                        {cv.data.languages.map((lang) => (
                          <li key={lang.id}>{lang.name} ({lang.level})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Certifications Section in Sidebar */}
                  {cv.data.certifications.length > 0 && (
                    <div className="w-full">
                      <h2 className="text-xl font-bold tracking-wider uppercase mb-4">Sertifikatlar</h2>
                      <div className="border-b-2 border-gray-500 w-12 mb-4"></div>
                      <div className="space-y-4">
                        {cv.data.certifications.map((cert) => (
                          <div key={cert.id}>
                            <h3 className="font-semibold">{cert.name}</h3>
                            <p className="text-sm text-gray-300">{cert.issuer} | {cert.issueDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Main Content - White */}
              <div className="w-2/3 p-12">

                {/* Header with Name and Title */}
                <div className="mb-10">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 uppercase">
                    {cv.data.personalInfo.name || 'AD VƏ SOYAD'}
                  </h1>
                  {/* We can extract title from first experience position if available */}
                  {cv.data.experience.length > 0 && (
                    <p className="text-lg md:text-xl font-medium text-gray-500 tracking-wider mt-2 uppercase">
                      {cv.data.experience[0].position}
                    </p>
                  )}
                </div>

                {/* Professional Summary */}
                {cv.data.personalInfo.summary && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-4">Profil</h2>
                    <div
                      className="text-gray-600 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: cv.data.personalInfo.summary }}
                    />
                  </section>
                )}

                {/* Experience Section */}
                {cv.data.experience.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6">İş Təcrübəsi</h2>
                    <div className="space-y-6">
                      {cv.data.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">{exp.position}</h3>
                            <p className="text-sm text-gray-500">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                          </div>
                          <p className="text-md text-gray-600 mb-1">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-500 mb-2">{exp.location}</p>}
                          {exp.description && (
                            <div
                              className="text-sm text-gray-600 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: exp.description }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects Section */}
                {cv.data.projects.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6">Layihələr</h2>
                    <div className="space-y-6">
                      {cv.data.projects.map((project) => (
                        <div key={project.id}>
                          <h3 className="text-lg font-semibold text-gray-700">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                              <strong>Texnologiyalar:</strong> {project.technologies.join(', ')}
                            </p>
                          )}
                          {project.url && (
                            <p className="text-sm text-blue-600 mt-1">{project.url}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Volunteer Experience Section */}
                {cv.data.volunteerExperience && cv.data.volunteerExperience.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6">Könüllü Təcrübə</h2>
                    <div className="space-y-6">
                      {cv.data.volunteerExperience.map((vol) => (
                        <div key={vol.id}>
                          <div className="flex justify-between items-baseline mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">{vol.role}</h3>
                            <p className="text-sm text-gray-500">{formatDateRange(vol.startDate, vol.endDate, vol.current)}</p>
                          </div>
                          <p className="text-md text-gray-600 mb-1">{vol.organization}</p>
                          {vol.cause && <p className="text-sm text-gray-500 mb-2">{vol.cause}</p>}
                          {vol.description && (
                            <p className="text-sm text-gray-600">{vol.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Publications Section */}
                {cv.data.publications && cv.data.publications.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6">Nəşrlər</h2>
                    <div className="space-y-6">
                      {cv.data.publications.map((pub) => (
                        <div key={pub.id}>
                          <h3 className="text-lg font-semibold text-gray-700">{pub.title}</h3>
                          {pub.publisher && (
                            <p className="text-md text-gray-600">{pub.publisher} | {pub.date}</p>
                          )}
                          {pub.authors && pub.authors.length > 0 && (
                            <p className="text-sm text-gray-500">Müəlliflər: {pub.authors.join(', ')}</p>
                          )}
                          {pub.description && (
                            <p className="text-sm text-gray-600 mt-2">{pub.description}</p>
                          )}
                          {pub.url && (
                            <p className="text-sm text-blue-600 mt-1">{pub.url}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for other template types and add visual distinction
  const getTemplateStyles = () => {
    console.log('🎨 Using template styling for:', cv.templateId);

    switch (cv.templateId) {
      default:
        // Basic template - keep original simple design
        return {
          containerClass: 'bg-white',
          headerClass: 'mb-6',
          headerTextClass: 'text-gray-900',
          sectionClass: 'mb-6',
          sectionHeaderClass: 'text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1',
          personalInfoClass: 'mb-6',
          nameClass: 'text-2xl font-bold text-gray-900 mb-2',
          contactClass: 'space-y-1 text-sm text-gray-600',
          experienceItemClass: 'border-l-2 border-blue-200 pl-4',
          accentColor: 'blue'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`rounded-lg shadow-sm border border-gray-200 overflow-hidden ${styles.containerClass}`}>
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
        <div id={cvElementId} className="bg-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' }}>

          {/* Header Section - Different for each template */}
          <div className={styles.headerClass}>
            <div className={styles.personalInfoClass}>
              <h1 className={styles.nameClass}>
                {cv.data.personalInfo.name || 'Ad və Soyad'}
              </h1>

              {/* Contact Info - Template specific layout */}
              <div className={styles.contactClass}>
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
                {cv.data.personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">

            {/* Professional Summary */}
            {cv.data.personalInfo.summary && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Peşəkar Özət
                </h2>
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: cv.data.personalInfo.summary }}
                />
              </div>
            )}

            {/* Experience */}
            {cv.data.experience.length > 0 && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  İş Təcrübəsi
                </h2>
                <div className="space-y-4">
                  {cv.data.experience.map((exp) => (
                    <div key={exp.id} className={styles.experienceItemClass}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                          <p className="text-md font-semibold text-gray-700">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                        </div>
                      </div>
                      {exp.description && (
                        <div
                          className="text-sm text-gray-700 prose prose-sm max-w-none mt-2"
                          dangerouslySetInnerHTML={{ __html: exp.description }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {cv.data.education.length > 0 && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Təhsil
                </h2>
                <div className="space-y-4">
                  {cv.data.education.map((edu) => (
                    <div key={edu.id} className="mb-4">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                          <p className="text-md font-semibold text-gray-700">{edu.institution}</p>
                          {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                        </div>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {cv.data.skills.length > 0 && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Bacarıqlar
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {cv.data.skills.map((skill) => (
                    <div key={skill.id} className="text-sm font-medium text-gray-900">
                      • {skill.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {cv.data.languages.length > 0 && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Dillər
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {cv.data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                      <span className="text-xs text-gray-500 font-medium">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {cv.data.projects.length > 0 && (
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Layihələr
                </h2>
                <div className="space-y-4">
                  {cv.data.projects.map((project) => (
                    <div key={project.id} className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                        <div className="text-sm text-gray-500">
                          {formatDateRange(project.startDate, project.endDate, project.current)}
                        </div>
                      </div>
                      {project.description && (
                        <div
                          className="text-sm text-gray-700 mb-2 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
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
              <div className={styles.sectionClass}>
                <h2 className={styles.sectionHeaderClass}>
                  Sertifikatlar
                </h2>
                <div className="space-y-3">
                  {cv.data.certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{cert.name}</h3>
                        <p className="text-sm text-gray-700">{cert.issuer}</p>
                        {cert.credentialId && (
                          <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(cert.issueDate)}
                        {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Sections */}
            {cv.data.customSections && cv.data.customSections.length > 0 && (
              cv.data.customSections.map((section) => {
                if (section.isVisible === false) return null;

                return (
                  <div key={section.id} className={styles.sectionClass}>
                    <h2 className={styles.sectionHeaderClass}>
                      {section.title || 'Əlavə Bölmə'}
                    </h2>

                    {section.description && (
                      <div
                        className="text-sm text-gray-600 mb-3 italic prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.description }}
                      />
                    )}

                    {section.items && section.items.length > 0 && (
                      <div className="space-y-3">
                        {section.items.map((item) => (
                          <div key={item.id} className="mb-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-gray-900">{item.title}</h3>
                              {item.date && (
                                <span className="text-sm text-gray-500">{item.date}</span>
                              )}
                            </div>
                            {item.location && (
                              <p className="text-sm text-gray-600">{item.location}</p>
                            )}
                            {item.description && (
                              <div
                                className="text-sm text-gray-700 mt-1 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
