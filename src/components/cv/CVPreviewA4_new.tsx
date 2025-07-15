'use client';

import React from 'react';

interface CVData {
  id?: string;
  title: string;
  templateId: string;
  data: {
    personalInfo: {
      name?: string;
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
      linkedin?: string;
      summary?: string;
    };
    experience?: Array<{
      id?: string;
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      location?: string;
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
  };
}

interface CVPreviewProps {
  cv: CVData;
}

const CVPreviewA4: React.FC<CVPreviewProps> = ({ cv }) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cv.data;
  
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
            {personalInfo?.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}>
                <span>{personalInfo.location}</span>
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
            <p style={{ marginBottom: '0.5rem', color: '#4b5563', margin: '0' }}>
              {personalInfo.summary}
            </p>
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
                  {exp.location && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>{exp.location}</div>
                  )}
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
    </div>
  );
};

export default CVPreviewA4;
