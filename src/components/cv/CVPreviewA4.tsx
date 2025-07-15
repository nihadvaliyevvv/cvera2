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
      title?: string;
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
  const isBoldTemplate = cv.templateId === 'resumonk-bold' || cv.templateId === 'Bold';
  
  if (isBoldTemplate) {
    return (
      <div style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        lineHeight: '1.5',
        color: '#333',
        background: 'white',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
      <div style={{
        height: '100%',
        overflowY: 'auto',
        padding: '20px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9',
        width: '794px', // Exact A4 width
        fontSize: '11pt', // Exact PDF font size
        lineHeight: '1.4' // Exact PDF line height
      }}>
          {/* Header - Bold style */}
          <div style={{ textAlign: 'left', marginBottom: '30px' }}>
            <div style={{ 
              fontSize: '36pt', 
            fontWeight: 'bold', 
            color: '#000', 
            marginBottom: '5px',
            textTransform: 'uppercase',
            lineHeight: '1'
          }}>
            {fullName}
          </div>
          <div style={{ 
            fontSize: '14pt', 
            color: '#666', 
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            {personalInfo?.title || 'Professional'}
          </div>
        </div>

        {/* Contact Info - Table style */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '30px'
        }}>
          <tbody>
            {personalInfo?.phone && (
              <tr>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f8f8', width: '20%', fontSize: '11pt' }}>Phone:</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '11pt' }}>{personalInfo.phone}</td>
              </tr>
            )}
            {personalInfo?.email && (
              <tr>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f8f8', width: '20%', fontSize: '11pt' }}>Email:</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '11pt' }}>{personalInfo.email}</td>
              </tr>
            )}
            {personalInfo?.website && (
              <tr>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f8f8', width: '20%', fontSize: '11pt' }}>Website:</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '11pt' }}>{personalInfo.website}</td>
              </tr>
            )}
            {personalInfo?.linkedin && (
              <tr>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f8f8', width: '20%', fontSize: '11pt' }}>LinkedIn:</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '11pt' }}>{personalInfo.linkedin}</td>
              </tr>
            )}
            {personalInfo?.location && (
              <tr>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f8f8f8', width: '20%', fontSize: '11pt' }}>Location:</td>
                <td style={{ padding: '5px 10px', border: '1px solid #ddd', fontSize: '11pt' }}>{personalInfo.location}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Summary */}
        {personalInfo?.summary && (
          <div style={{
            fontSize: '11pt',
            lineHeight: '1.5',
            marginBottom: '20px',
            textAlign: 'justify'
          }}>
            {personalInfo.summary}
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>EXPERIENCE</div>
            {experience.map((exp, index) => (
              <div key={index} style={{
                marginBottom: '20px',
                pageBreakInside: 'avoid'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '5px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '14pt',
                      fontWeight: 'bold',
                      color: '#000'
                    }}>{exp.company || ''}</div>
                    <div style={{
                      fontSize: '12pt',
                      fontStyle: 'italic',
                      color: '#333',
                      marginBottom: '5px'
                    }}>{exp.position || ''}</div>
                  </div>
                  <div style={{
                    fontSize: '11pt',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    {exp.startDate || ''} - {exp.endDate ? exp.endDate : (exp.current ? 'Present' : '')}
                  </div>
                </div>
                {exp.description && (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '11pt',
                    lineHeight: '1.4'
                  }}>
                    {exp.description.split('\n').map((line, i) => (
                      <div key={i} style={{ marginBottom: '3px' }}>
                        {line.trim().startsWith('•') || line.trim().startsWith('-') ? 
                          `• ${line.replace(/^[•-]\s*/, '')}` : 
                          line
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>EDUCATION</div>
            {education.map((edu, index) => (
              <div key={index} style={{
                marginBottom: '15px',
                pageBreakInside: 'avoid'
              }}>
                <div style={{
                  fontSize: '13pt',
                  fontWeight: 'bold',
                  color: '#000'
                }}>{edu.institution || ''}</div>
                <div style={{
                  fontSize: '12pt',
                  color: '#333',
                  marginBottom: '5px'
                }}>{edu.degree || ''}</div>
                <div style={{
                  fontSize: '11pt',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {edu.startDate || ''} - {edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}
                </div>
                {edu.gpa && (
                  <div style={{
                    fontSize: '11pt',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>GPA: {edu.gpa}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>SKILLS</div>
            <div style={{
              fontSize: '11pt',
              lineHeight: '1.6'
            }}>
              {skills.map((skill, index) => skill.name || '').filter(Boolean).join(', ')}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>LANGUAGES</div>
            <div style={{
              fontSize: '11pt',
              lineHeight: '1.6'
            }}>
              {languages.map((lang, index) => `${lang.name || ''}: ${lang.level || ''}`).filter(Boolean).join(', ')}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>PROJECTS</div>
            {projects.map((project, index) => (
              <div key={index} style={{
                marginBottom: '15px',
                pageBreakInside: 'avoid'
              }}>
                <div style={{
                  fontSize: '13pt',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '5px'
                }}>{project.name || ''}</div>
                {project.description && (
                  <div style={{
                    fontSize: '11pt',
                    lineHeight: '1.4',
                    marginBottom: '5px'
                  }}>{project.description}</div>
                )}
                {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                  <div style={{
                    fontSize: '10pt',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>Technologies: {project.technologies.join(', ')}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div>
            <div style={{
              fontSize: '14pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              margin: '25px 0 15px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px'
            }}>CERTIFICATIONS</div>
            {certifications.map((cert, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                pageBreakInside: 'avoid'
              }}>
                <div style={{
                  fontSize: '12pt',
                  fontWeight: 'bold',
                  color: '#000'
                }}>{cert.name || ''}</div>
                <div style={{
                  fontSize: '11pt',
                  color: '#666'
                }}>{cert.issuer || ''} | {cert.date || ''}</div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    );
  }
  
  // Basic Template (default)
  return (
    <div style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: '11pt',
      lineHeight: '1.5',
      color: '#333',
      background: 'white',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      <div style={{
        height: '100%',
        overflowY: 'auto',
        padding: '20px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9'
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
    </div>
  );
};

export default CVPreviewA4;
