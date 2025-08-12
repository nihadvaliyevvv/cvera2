'use client';

import React from 'react';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {      personalInfo: {
        name?: string;
        fullName?: string;
        email?: string;
        phone?: string;
        website?: string;
        linkedin?: string;
        summary?: string;
      };      experience?: Array<{
        id?: string;
        company?: string;
        position?: string;
        startDate?: string;
        endDate?: string;
        current?: boolean;
        description?: string;
      }>;
    education?: Array<{
      id?: string;
      institution?: string;
      degree?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      gpa?: string;
      description?: string;
    }>;
    skills?: Array<{
      id?: string;
      name?: string;
      category?: string;
    }>;
    languages?: Array<{
      id?: string;
      name?: string;
      level?: string;
    }>;
    projects?: Array<{
      id?: string;
      name?: string;
      description?: string;
      technologies?: string[];
      url?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }>;
    certifications?: Array<{
      id?: string;
      name?: string;
      issuer?: string;
      date?: string;
      issueDate?: string;
      expiryDate?: string;
      credentialId?: string;
      url?: string;
    }>;
    volunteerExperience?: Array<{
      id?: string;
      organization?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      cause?: string;
    }>;
    publications?: Array<{
      id?: string;
      title?: string;
      description?: string;
      url?: string;
      date?: string;
      publisher?: string;
      authors?: string[];
    }>;
    honorsAwards?: Array<{
      id?: string;
      title?: string;
      description?: string;
      date?: string;
      issuer?: string;
      url?: string;
    }>;
    testScores?: Array<{
      id?: string;
      testName?: string;
      score?: string;
      date?: string;
      description?: string;
    }>;
    recommendations?: Array<{
      id?: string;
      recommenderName?: string;
      recommenderTitle?: string;
      recommenderCompany?: string;
      text?: string;
      date?: string;
    }>;
    courses?: Array<{
      id?: string;
      name?: string;
      institution?: string;
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

interface CVPreviewProps {
  cv: CVData;
}

const CVPreviewA4: React.FC<CVPreviewProps> = ({ cv }) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications, honorsAwards, testScores, recommendations, courses, customSections } = cv.data;

  // Debug: Custom sections məlumatını console-da göstər
  console.log('🔍 CVPreviewA4_new Debug:', {
    customSections,
    customSectionsLength: customSections?.length || 0,
    hasItems: customSections?.some(section => section.items && section.items.length > 0),
    visibleSections: customSections?.filter(section => section.isVisible !== false) || []
  });

  const fullName = personalInfo?.fullName || personalInfo?.name || '';
  
  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#333',
      background: 'white',
      width: '100%',
      height: '100%',
      padding: '15px 20px 20px 20px',
      overflow: 'hidden'
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
            {fullName}
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
            {personalInfo?.email && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo?.phone && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo?.linkedin && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>LinkedIn: {personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo?.website && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>Website: {personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary */}
        {personalInfo?.summary && (
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
            <div
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: personalInfo.summary || '' }}
                          />
          </div>
        )}
      </div>

      {/* Work Experience */}
      {experience && experience.length > 0 && (
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
            }}>Work Experience</h2>
          </div>
          {experience.map((exp, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #3b82f6',
              background: '#f8fafc',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                gap: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>{exp.position || ''}</div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#3b82f6',
                    marginBottom: '0.25rem'
                  }}>{exp.company || ''}</div>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {exp.startDate || ''} - {exp.endDate ? exp.endDate : (exp.current ? 'Present' : '')}
                </div>
              </div>
              {exp.description && (
                <div style={{
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginTop: '0.3rem',
                  minHeight: '30px',
                  paddingTop: '0.3rem',
                  borderTop: '1px solid #e5e7eb'
                }}>{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
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
            }}>Education</h2>
          </div>
          {education.map((edu, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #10b981',
              background: '#f0fdf4',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>{edu.degree || ''}</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#10b981',
                marginBottom: '0.25rem'
              }}>{edu.institution || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                {edu.startDate || ''} - {edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
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
            }}>Skills</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.8rem',
            width: '100%',
            marginTop: '0.5rem'
          }}>
            {skills.map((skill, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: '0.3rem'
              }}>
                <span style={{
                  fontWeight: '500',
                  color: '#374151'
                }}>{skill.name || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
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
            }}>Languages</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.8rem',
            width: '100%'
          }}>
            {languages.map((lang, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                marginBottom: '0.3rem'
              }}>
                <span>{lang.name || ''}</span>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>{lang.level || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
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
            }}>Projects</h2>
          </div>
          {projects.map((project, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              background: '#fafafa',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>{project.name || ''}</div>
              {project.description && (
                <div style={{
                  color: '#4b5563',
                  marginBottom: '0.75rem'
                }}>{project.description}</div>
              )}
              {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
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
            }}>Certifications</h2>
          </div>
          {certifications.map((cert, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #f59e0b',
              background: '#fffbeb',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid'
            }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>{cert.name || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#f59e0b',
                marginBottom: '0.25rem'
              }}>{cert.issuer || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>{cert.date || cert.issueDate || ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Volunteer Experience */}
      {volunteerExperience && volunteerExperience.length > 0 && (
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
            }}>Volunteer Experience</h2>
          </div>
          {volunteerExperience.map((vol, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #3b82f6',
              background: '#f8fafc',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                gap: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>{vol.role || ''}</div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#3b82f6',
                    marginBottom: '0.25rem'
                  }}>{vol.organization || ''}</div>
                  {vol.cause && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>{vol.cause}</div>
                  )}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {vol.startDate || ''} - {vol.current ? 'Present' : vol.endDate || ''}
                </div>
              </div>
              {vol.description && (
                <div style={{
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginTop: '0.3rem',
                  minHeight: '30px',
                  paddingTop: '0.3rem',
                  borderTop: '1px solid #e5e7eb'
                }}>{vol.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Publications */}
      {publications && publications.length > 0 && (
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
            }}>Publications</h2>
          </div>
          {publications.map((pub, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #3b82f6',
              background: '#f8fafc',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                gap: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>{pub.title || ''}</div>
                  {pub.publisher && (
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '500',
                      color: '#3b82f6',
                      marginBottom: '0.25rem'
                    }}>{pub.publisher}</div>
                  )}
                  {pub.authors && pub.authors.length > 0 && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>Authors: {pub.authors.join(', ')}</div>
                  )}
                </div>
                {pub.date && (
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>{pub.date}</div>
                )}
              </div>
              {pub.description && (
                <div style={{
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginTop: '0.3rem',
                  minHeight: '30px',
                  paddingTop: '0.3rem',
                  borderTop: '1px solid #e5e7eb'
                }}>{pub.description}</div>
              )}
              {pub.url && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    {pub.url}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Honors & Awards */}
      {honorsAwards && honorsAwards.length > 0 && (
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
            }}>Honors & Awards</h2>
          </div>
          {honorsAwards.map((award, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #4ade80',
              background: '#f0fdf4',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.25rem'
              }}>{award.title || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>{award.date || ''}</div>
              {award.description && (
                <div style={{
                  color: '#4b5563',
                  marginBottom: '0.75rem'
                }}>{award.description}</div>
              )}
              {award.issuer && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>{award.issuer}</div>
              )}
              {award.url && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <a href={award.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    {award.url}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Test Scores */}
      {testScores && testScores.length > 0 && (
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
            }}>Test Scores</h2>
          </div>
          {testScores.map((test, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #f97316',
              background: '#fff7ed',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.25rem'
              }}>{test.testName || ''}</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#f97316',
                marginBottom: '0.25rem'
              }}>{test.score || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>{test.date || ''}</div>
              {test.description && (
                <div style={{
                  color: '#4b5563',
                  marginBottom: '0.75rem'
                }}>{test.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
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
            }}>Recommendations</h2>
          </div>
          {recommendations.map((rec, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #3b82f6',
              background: '#f8fafc',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                gap: '1rem'
              }}>
                <div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.25rem'
                  }}>{rec.recommenderName || ''}</div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#3b82f6',
                    marginBottom: '0.25rem'
                  }}>{rec.recommenderTitle || ''} at {rec.recommenderCompany || ''}</div>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  {rec.date || ''}
                </div>
              </div>
              {rec.text && (
                <div style={{
                  color: '#4b5563',
                  lineHeight: '1.6',
                  marginTop: '0.3rem',
                  minHeight: '30px',
                  paddingTop: '0.3rem',
                  borderTop: '1px solid #e5e7eb'
                }}>{rec.text}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Courses */}
      {courses && courses.length > 0 && (
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
            }}>Courses</h2>
          </div>
          {courses.map((course, index) => (
            <div key={index} style={{
              marginBottom: '0.8rem',
              padding: '0.8rem',
              borderLeft: '3px solid #9333ea',
              background: '#f5f3ff',
              borderRadius: '0 0.5rem 0.5rem 0',
              pageBreakInside: 'avoid',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.25rem'
              }}>{course.name || ''}</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                color: '#9333ea',
                marginBottom: '0.25rem'
              }}>{course.institution || ''}</div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '0.25rem'
              }}>{course.completionDate || ''}</div>
              {course.description && (
                <div style={{
                  color: '#4b5563',
                  marginBottom: '0.75rem'
                }}>{course.description}</div>
              )}
              {course.certificate && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Certificate available</div>
              )}
              {course.url && (
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    {course.url}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && (
        <div>
          {customSections.map((section) => (
            section.isVisible !== false && (
              <div key={section.id} style={{ marginBottom: '0.8rem', pageBreakInside: 'avoid' }}>
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
                  }}>{section.title}</h2>
                </div>
                {section.description && (
                  <div style={{
                    color: '#4b5563',
                    marginBottom: '0.5rem',
                    lineHeight: '1.6'
                  }}>{section.description}</div>
                )}
                {section.items && section.items.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '0.8rem',
                    width: '100%',
                    marginTop: '0.5rem'
                  }}>
                    {section.items.map((item) => (
                      <div key={item.id} style={{
                        padding: '0.8rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        background: '#fafafa',
                        pageBreakInside: 'avoid',
                        minHeight: '60px'
                      }}>
                        <div style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '0.25rem'
                        }}>{item.title}</div>
                        {item.description && (
                          <div style={{
                            color: '#4b5563',
                            marginBottom: '0.5rem',
                            lineHeight: '1.6'
                          }}>{item.description}</div>
                        )}
                        {item.date && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.5rem'
                          }}>{item.date}</div>
                        )}
                        {item.location && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.5rem'
                          }}>{item.location}</div>
                        )}
                        {item.url && (
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            fontStyle: 'italic'
                          }}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                              {item.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default CVPreviewA4;
