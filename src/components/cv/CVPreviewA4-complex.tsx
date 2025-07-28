'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { CVData as CVDataType } from '@/types/cv';
import styles from './CVPreviewA4-complex.module.css';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: CVDataType;
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
const pdfStyles = {
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
    textAlign: 'center' as const,
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
    flexWrap: 'wrap' as const,
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
    textAlign: 'right' as const,
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
        {/* Header Section */}
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

        {/* Summary */}
        {cv.data.personalInfo.summary && (
          <div style={pdfStyles.section}>
            <div style={pdfStyles.sectionHeader}>
            <h2 style={pdfStyles.sectionTitle}>Özet</h2>
          </div>
          <p style={pdfStyles.summary}>{cv.data.personalInfo.summary}</p>
        </div>
      )}

      {/* Experience Section */}
      {cv.data.experience && cv.data.experience.length > 0 && (
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
                <div style={pdfStyles.experienceDescription}>{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education Section */}
      {cv.data.education && cv.data.education.length > 0 && (
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
      )}

      {/* Skills Section */}
      {cv.data.skills && cv.data.skills.length > 0 && (
        <div style={pdfStyles.section}>
          <div style={pdfStyles.sectionHeader}>
            <h2 style={pdfStyles.sectionTitle}>Bacarıqlar</h2>
          </div>
          <div style={pdfStyles.skillsGrid}>
            {cv.data.skills.map((skill, index) => (
              <div key={index} style={pdfStyles.skillCategory}>
                <div style={pdfStyles.skillCategoryTitle}>Bacarıqlar</div>
                <div style={pdfStyles.skillItem}>
                  <span>{skill.name || 'Bacarıq'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages Section */}
      {cv.data.languages && cv.data.languages.length > 0 && (
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
      )}

      {/* Projects Section */}
      {cv.data.projects && cv.data.projects.length > 0 && (
        <div style={pdfStyles.section}>
          <div style={pdfStyles.sectionHeader}>
            <h2 style={pdfStyles.sectionTitle}>Layihələr</h2>
          </div>
          {cv.data.projects.map((project, index) => (
            <div key={index} style={pdfStyles.projectItem}>
              <div style={pdfStyles.projectName}>{project.name}</div>
              {project.description && (
                <div style={pdfStyles.projectDescription}>{project.description}</div>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div style={pdfStyles.projectTech}>
                  Texnologiyalar: {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications Section */}
      {cv.data.certifications && cv.data.certifications.length > 0 && (
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
      )}
      </div>
    </div>
  );
}
