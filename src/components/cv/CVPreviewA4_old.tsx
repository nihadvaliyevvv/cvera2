'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import styles from './CVEditor.module.css';

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
      summary?: string;
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
      level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
      category?: string;
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
      description: string;
      cause?: string;
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
      const templates = await apiClient.getTemplates();
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
      <div className={styles['cv-preview-container']}>
        <div className={`${styles['cv-preview-content']} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#333',
      background: 'white',
      width: '100%',
      height: '100%',
      padding: '15px 20px 20px 20px'
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: '0.8rem', pageBreakInside: 'avoid', minHeight: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '0.3rem', 
            lineHeight: '1.2',
            margin: '0 0 0.3rem 0'
          }}>
            {cv.data.personalInfo.name || 'Ad və Soyad'}
          </h1>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginBottom: '0.8rem',
            padding: '0.8rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            justifyContent: 'center'
          }}>
            {cv.data.personalInfo.email && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{cv.data.personalInfo.email}</span>
              </div>
            )}
            {cv.data.personalInfo.phone && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{cv.data.personalInfo.phone}</span>
              </div>
            )}
            {cv.data.personalInfo.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{cv.data.personalInfo.location}</span>
              </div>
            )}
            {cv.data.personalInfo.linkedin && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>LinkedIn: {cv.data.personalInfo.linkedin}</span>
              </div>
            )}
            {cv.data.personalInfo.website && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>Website: {cv.data.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary */}
        {cv.data.personalInfo.summary && (
          <div style={{ marginBottom: '0.8rem', pageBreakInside: 'avoid', minHeight: '40px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              paddingBottom: '0.3rem',
              pageBreakAfter: 'avoid',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.375rem',
                fontWeight: '700',
                color: '#1f2937',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '0'
              }}>Summary</h2>
            </div>
            <p style={{ marginBottom: '0.5rem', color: '#4b5563', margin: '0' }}>
              {cv.data.personalInfo.summary}
            </p>
          </div>
        )}
      </div>

        {/* Experience Section */}
        {cv.data.experience && cv.data.experience.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>💼</div>
              <h2 className={styles['cv-section-title']}>İş Təcrübəsi</h2>
            </div>
            {cv.data.experience.map((exp, index) => (
              <div key={index} className={styles['cv-experience-item']}>
                <div className={styles['cv-experience-header']}>
                  <div>
                    <div className={styles['cv-experience-title']}>{exp.position}</div>
                    <div className={styles['cv-experience-company']}>{exp.company}</div>
                    {exp.location && (
                      <div className={styles['cv-experience-location']}>{exp.location}</div>
                    )}
                  </div>
                  <div className={styles['cv-experience-date']}>
                    {exp.startDate} - {exp.current ? 'Hazırda' : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <div className={styles['cv-experience-description']}>{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education Section */}
        {cv.data.education && cv.data.education.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>🎓</div>
              <h2 className={styles['cv-section-title']}>Təhsil</h2>
            </div>
            {cv.data.education.map((edu, index) => (
              <div key={index} className={styles['cv-education-item']}>
                <div className={styles['cv-education-degree']}>{edu.degree}</div>
                <div className={styles['cv-education-institution']}>{edu.institution}</div>
                {edu.field && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{edu.field}</div>}
                <div className={styles['cv-experience-date']}>
                  {edu.startDate} - {edu.current ? 'Hazırda' : edu.endDate}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>GPA: {edu.gpa}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills Section */}
        {cv.data.skills && cv.data.skills.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>🛠️</div>
              <h2 className={styles['cv-section-title']}>Bacarıqlar</h2>
            </div>
            <div className={styles['cv-skills-grid']}>
              {cv.data.skills.reduce((acc: any[], skill) => {
                const categoryIndex = acc.findIndex(item => item.category === skill.category);
                if (categoryIndex >= 0) {
                  acc[categoryIndex].skills.push(skill);
                } else {
                  acc.push({
                    category: skill.category || 'Ümumi',
                    skills: [skill]
                  });
                }
                return acc;
              }, []).map((category, index) => (
                <div key={index} className={styles['cv-skill-category']}>
                  <div className={styles['cv-skill-category-title']}>{category.category}</div>
                  {category.skills.map((skill: any, skillIndex: number) => (
                    <div key={skillIndex} className={styles['cv-skill-item']}>
                      <span className={styles['cv-skill-name']}>{skill.name}</span>
                      <span className={styles['cv-skill-level']}>{skill.level}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {cv.data.languages && cv.data.languages.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>🌐</div>
              <h2 className={styles['cv-section-title']}>Dillər</h2>
            </div>
            <div className={styles['cv-languages-grid']}>
              {cv.data.languages.map((lang, index) => (
                <div key={index} className={styles['cv-language-item']}>
                  <span className={styles['cv-skill-name']}>{lang.name}</span>
                  <span className={styles['cv-skill-level']}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {cv.data.projects && cv.data.projects.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>🚀</div>
              <h2 className={styles['cv-section-title']}>Layihələr</h2>
            </div>
            {cv.data.projects.map((project, index) => (
              <div key={index} className={styles['cv-project-item']}>
                <div className={styles['cv-project-title']}>{project.name}</div>
                {project.description && (
                  <div className={styles['cv-project-description']}>{project.description}</div>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className={styles['cv-project-technologies']}>
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className={styles['cv-project-tech']}>{tech}</span>
                    ))}
                  </div>
                )}
                <div className={styles['cv-experience-date']}>
                  {project.startDate} - {project.current ? 'Hazırda' : project.endDate}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications Section */}
        {cv.data.certifications && cv.data.certifications.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>🏆</div>
              <h2 className={styles['cv-section-title']}>Sertifikatlar</h2>
            </div>
            {cv.data.certifications.map((cert, index) => (
              <div key={index} className={styles['cv-certification-item']}>
                <div className={styles['cv-certification-name']}>{cert.name}</div>
                <div className={styles['cv-certification-issuer']}>{cert.issuer}</div>
                <div className={styles['cv-certification-date']}>{cert.issueDate}</div>
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Experience Section */}
        {cv.data.volunteerExperience && cv.data.volunteerExperience.length > 0 && (
          <div className={styles['cv-section']}>
            <div className={styles['cv-section-header']}>
              <div className={styles['cv-section-icon']}>❤️</div>
              <h2 className={styles['cv-section-title']}>Könüllü Təcrübə</h2>
            </div>
            {cv.data.volunteerExperience.map((vol, index) => (
              <div key={index} className={styles['cv-experience-item']}>
                <div className={styles['cv-experience-header']}>
                  <div>
                    <div className={styles['cv-experience-title']}>{vol.role}</div>
                    <div className={styles['cv-experience-company']}>{vol.organization}</div>
                    {vol.cause && (
                      <div className={styles['cv-experience-location']}>{vol.cause}</div>
                    )}
                  </div>
                  <div className={styles['cv-experience-date']}>
                    {vol.startDate} - {vol.current ? 'Hazırda' : vol.endDate}
                  </div>
                </div>
                {vol.description && (
                  <div className={styles['cv-experience-description']}>{vol.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Template Attribution */}
        {template && (
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Template: {template.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
