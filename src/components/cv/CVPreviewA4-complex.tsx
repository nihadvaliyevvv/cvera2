'use client';

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { apiClient } from '@/lib/api';
import { CVData as CVDataType } from '@/types/cv';
import styles from './CVPreviewA4-complex.module.css';
import { useSimpleFontSettings } from '@/hooks/useSimpleFontSettings';
import { FontManager } from '@/lib/fontManager';

// Utility function to safely render HTML content while preserving formatting
const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return html
        // Remove dangerous tags but keep formatting ones
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<meta[^>]*>/gi, '')
        // Keep basic formatting tags
        // Convert line breaks properly
        .replace(/<br\s*\/?>/gi, '<br>')
        // Clean up HTML entities
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
};

// Alternative text-only function for fallback
const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<\/h[1-6]>/gi, '\n')
        .replace(/<h[1-6][^>]*>/gi, '')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/ul>/gi, '\n')
        .replace(/<ul[^>]*>/gi, '')
        .replace(/<\/ol>/gi, '\n')
        .replace(/<ol[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .trim();
};

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: CVDataType & {
    sectionOrder?: Array<{
      id: string;
      type: string;
      isVisible: boolean;
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

// Fixed PDF-like styling - no responsive behavior
const pdfStyles: { [key: string]: React.CSSProperties } = {
  page: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '11pt',
    lineHeight: '1.4',
    color: '#000000',
    margin: '0',
    padding: '0',
  },
  section: {
    marginBottom: '16pt',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24pt',
    paddingBottom: '12pt',
    borderBottom: '1pt solid #e5e7eb',
  },
  name: {
    fontSize: '24pt',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8pt',
    lineHeight: '1.2',
  },
  contactInfo: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '16pt',
    fontSize: '10pt',
    color: '#374151',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4pt',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8pt',
    marginBottom: '12pt',
    paddingBottom: '4pt',
    borderBottom: '1pt solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '14pt',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0',
  },
  summary: {
    fontSize: '11pt',
    lineHeight: '1.5',
    color: '#374151',
    marginBottom: '0',
  },
  experienceItem: {
    marginBottom: '16pt',
  },
  experienceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6pt',
  },
  experienceTitle: {
    fontSize: '12pt',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2pt',
  },
  experienceCompany: {
    fontSize: '11pt',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '2pt',
  },
  experienceDate: {
    fontSize: '10pt',
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  experienceDescription: {
    fontSize: '10pt',
    lineHeight: '1.4',
    color: '#374151',
  },
  educationItem: {
    marginBottom: '12pt',
  },
  educationDegree: {
    fontSize: '12pt',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2pt',
  },
  educationInstitution: {
    fontSize: '11pt',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '2pt',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12pt',
  },
  skillCategory: {
    marginBottom: '8pt',
  },
  skillCategoryTitle: {
    fontSize: '11pt',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4pt',
  },
  skillItem: {
    fontSize: '10pt',
    color: '#374151',
    marginBottom: '2pt',
  },
  languageItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6pt',
    fontSize: '10pt',
  },
  languageName: {
    fontWeight: '500',
    color: '#1f2937',
  },
  languageLevel: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  projectItem: {
    marginBottom: '12pt',
  },
  projectName: {
    fontSize: '11pt',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4pt',
  },
  projectDescription: {
    fontSize: '10pt',
    lineHeight: '1.4',
    color: '#374151',
    marginBottom: '4pt',
  },
  projectTech: {
    fontSize: '9pt',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};

export default function CVPreviewA4({ cv }: CVPreviewProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Font settings
  const { fontSettings } = useSimpleFontSettings(cv.id);

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

  // Section render functions
  const renderPersonalSection = () => (
    <div style={pdfStyles.header}>
      <h1 style={pdfStyles.name}>
        {cv.data.personalInfo.fullName || 'Ad Soyad'}
      </h1>
      <div style={pdfStyles.contactInfo}>
        {cv.data.personalInfo.email && (
          <div style={pdfStyles.contactItem}>
            <span>Email:</span>
            <span>{cv.data.personalInfo.email}</span>
          </div>
        )}
        {cv.data.personalInfo.phone && (
          <div style={pdfStyles.contactItem}>
            <span>Tel:</span>
            <span>{cv.data.personalInfo.phone}</span>
          </div>
        )}
        {cv.data.personalInfo.linkedin && (
          <div style={pdfStyles.contactItem}>
            <span>LinkedIn:</span>
            <span>LinkedIn</span>
          </div>
        )}
        {cv.data.personalInfo.website && (
          <div style={pdfStyles.contactItem}>
            <span>Website:</span>
            <span>Website</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderSummarySection = () => {
    if (!cv.data.personalInfo.summary) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Özet</h2>
        </div>
        <div style={pdfStyles.summary}>{stripHtmlTags(cv.data.personalInfo.summary)}</div>
      </div>
    );
  };

  const renderExperienceSection = () => {
    if (!cv.data.experience || cv.data.experience.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>İş Təcrübəsi</h2>
        </div>
        {cv.data.experience.map((exp, index) => (
          <div key={index} style={pdfStyles.experienceItem}>
            <div style={pdfStyles.experienceHeader}>
              <div>
                <div style={pdfStyles.experienceTitle}>{exp.position}</div>
                <div style={pdfStyles.experienceCompany}>{exp.company}</div>
              </div>
              <div style={pdfStyles.experienceDate}>
                {exp.startDate} - {exp.endDate || 'Hazırda'}
              </div>
            </div>
            {exp.description && (
              <div style={pdfStyles.experienceDescription}>{stripHtmlTags(exp.description)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEducationSection = () => {
    if (!cv.data.education || cv.data.education.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Təhsil</h2>
        </div>
        {cv.data.education.map((edu, index) => (
          <div key={index} style={pdfStyles.educationItem}>
            <div style={pdfStyles.educationDegree}>{edu.degree}</div>
            <div style={pdfStyles.educationInstitution}>{edu.institution}</div>
            <div style={pdfStyles.experienceDate}>
              {edu.startDate} - {edu.endDate || 'Hazırda'}
            </div>
            {edu.gpa && (
              <div style={{ fontSize: '10pt', color: '#6b7280' }}>GPA: {edu.gpa}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkillsSection = () => {
    if (!cv.data.skills || cv.data.skills.length === 0) return null;

    const hardSkills = cv.data.skills.filter(skill => skill.type === 'hard' || !skill.type);
    const softSkills = cv.data.skills.filter(skill => skill.type === 'soft');

    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Bacarıqlar</h2>
        </div>

        {hardSkills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Hard Skills</h3>
            <div style={pdfStyles.skillsGrid}>
              {hardSkills.map((skill, index) => (
                <div key={index} style={pdfStyles.skillCategory}>
                  <div style={pdfStyles.skillItem}>
                    <span>{skill.name || 'Bacarıq'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {softSkills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Soft Skills</h3>
            <div style={pdfStyles.skillsGrid}>
              {softSkills.map((skill, index) => (
                <div key={index} style={pdfStyles.skillCategory}>
                  <div style={pdfStyles.skillItem}>
                    <span>{skill.name || 'Bacarıq'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLanguagesSection = () => {
    if (!cv.data.languages || cv.data.languages.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Dillər</h2>
        </div>
        {cv.data.languages.map((lang, index) => (
          <div key={index} style={pdfStyles.languageItem}>
            <span style={pdfStyles.languageName}>{lang.language}</span>
            <span style={pdfStyles.languageLevel}>{lang.level}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectsSection = () => {
    if (!cv.data.projects || cv.data.projects.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Layihələr</h2>
        </div>
        {cv.data.projects.map((project, index) => (
          <div key={index} style={pdfStyles.projectItem}>
            <div style={pdfStyles.projectName}>{project.name}</div>
            {(project.startDate || project.endDate || project.current) && (
              <div style={pdfStyles.dateRange}>
                {project.startDate && project.endDate && !project.current && 
                  `${project.startDate} - ${project.endDate}`
                }
                {project.startDate && project.current && 
                  `${project.startDate} - davam edir`
                }
                {project.startDate && !project.endDate && !project.current && 
                  project.startDate
                }
              </div>
            )}
            {project.description && (
              <div style={pdfStyles.projectDescription}>{stripHtmlTags(project.description)}</div>
            )}
            {project.technologies && project.technologies.length > 0 && (
              <div style={pdfStyles.projectTech}>
                Texnologiyalar: {project.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCertificationsSection = () => {
    if (!cv.data.certifications || cv.data.certifications.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Sertifikatlar</h2>
        </div>
        {cv.data.certifications.map((cert, index) => (
          <div key={index} style={pdfStyles.educationItem}>
            <div style={pdfStyles.educationDegree}>{cert.name}</div>
            <div style={pdfStyles.educationInstitution}>{cert.issuer}</div>
            <div style={pdfStyles.experienceDate}>{cert.date}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderVolunteerSection = () => {
    if (!cv.data.volunteerExperience || cv.data.volunteerExperience.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Könüllü Təcrübə</h2>
        </div>
        {cv.data.volunteerExperience.map((vol, index) => (
          <div key={index} style={pdfStyles.experienceItem}>
            <div style={pdfStyles.experienceHeader}>
              <div>
                <div style={pdfStyles.experienceTitle}>{vol.role}</div>
                <div style={pdfStyles.experienceCompany}>{vol.organization}</div>
              </div>
              <div style={pdfStyles.experienceDate}>
                {vol.startDate} - {vol.endDate || 'Hazırda'}
              </div>
            </div>
            {vol.description && (
              <div style={pdfStyles.experienceDescription}>{stripHtmlTags(vol.description)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPublicationsSection = () => {
    if (!cv.data.publications || cv.data.publications.length === 0) return null;
    return (
      <div style={pdfStyles.section}>
        <div style={pdfStyles.sectionHeader}>
          <h2 style={pdfStyles.sectionTitle}>Nəşrlər</h2>
        </div>
        {cv.data.publications.map((pub, index) => (
          <div key={index} style={pdfStyles.projectItem}>
            <div style={pdfStyles.projectName}>{pub.title}</div>
            {pub.publisher && <div style={pdfStyles.educationInstitution}>{pub.publisher}</div>}
            {pub.date && <div style={pdfStyles.experienceDate}>{pub.date}</div>}
            {pub.description && (
              <div style={pdfStyles.projectDescription}>{stripHtmlTags(pub.description)}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Get ordered sections based on sectionOrder
  const getOrderedSections = () => {
    const defaultOrder = [
      { id: 'personal', type: 'personal', isVisible: true },
      { id: 'summary', type: 'summary', isVisible: true },
      { id: 'experience', type: 'experience', isVisible: true },
      { id: 'education', type: 'education', isVisible: true },
      { id: 'skills', type: 'skills', isVisible: true },
      { id: 'projects', type: 'projects', isVisible: true },
      { id: 'languages', type: 'languages', isVisible: true },
      { id: 'certifications', type: 'certifications', isVisible: true },
      { id: 'volunteerExperience', type: 'volunteerExperience', isVisible: true },
      { id: 'publications', type: 'publications', isVisible: true }
    ];

    const sectionOrder = cv.data.sectionOrder || defaultOrder;

    const sectionRenderers: { [key: string]: () => React.ReactElement | null } = {
      personal: renderPersonalSection,
      summary: renderSummarySection,
      experience: renderExperienceSection,
      education: renderEducationSection,
      skills: renderSkillsSection,
      projects: renderProjectsSection,
      languages: renderLanguagesSection,
      certifications: renderCertificationsSection,
      volunteerExperience: renderVolunteerSection,
      publications: renderPublicationsSection
    };

    return sectionOrder
      .filter((section: any) => section.isVisible !== false)
      .map((section: any) => {
        const sectionType = section.type || section.id;
        const renderer = sectionRenderers[sectionType];
        return renderer ? renderer() : null;
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '10pt' }}>Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...pdfStyles.page,
      fontFamily: fontSettings.fontFamily,
      fontSize: `${fontSettings.fontSize}pt`,
      height: '100%',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Scrollable content wrapper */}
      <div className={styles.a4PreviewContent} style={{
        height: '100%',
        overflowY: 'auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        {getOrderedSections()}
      </div>
    </div>
  );
}
