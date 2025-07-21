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
      website?: string;
      linkedin?: string;
      summary?: string;
      title?: string;
      profileImage?: string;
    };
    experience?: Array<{
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
  };
}

interface CVPreviewProps {
  cv: CVData;
}

const CVPreviewA4: React.FC<CVPreviewProps> = ({ cv }) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cv.data;
  
  const fullName = personalInfo?.fullName || personalInfo?.name || '';
  const isBoldTemplate = cv.templateId === 'resumonk-bold' || cv.templateId === 'Bold';
  const isElegantTemplate = cv.templateId === 'template_medium_elegant_1753124012305';
  const isExecutiveTemplate = cv.templateId === 'template_premium_executive_1753124012752';
  
  if (isBoldTemplate) {
    return (
      <div style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        lineHeight: '1.4',
        color: '#333',
        background: 'white',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
      <div style={{
        height: '100%',
        overflowY: 'auto',
        padding: '15px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 #f1f5f9',
        width: '794px', // Exact A4 width
        fontSize: '11pt', // Exact PDF font size
        lineHeight: '1.4' // Exact PDF line height
      }}>
          {/* Header - Bold style */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            {personalInfo?.profileImage && (
              <div style={{
                flexShrink: 0,
                width: '80px',
                height: '80px'
              }}>
                <img 
                  src={personalInfo.profileImage}
                  alt="Profile"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ddd'
                  }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
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
                {personalInfo?.title || ''}
              </div>
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
            }}>EXPERIENCE</div>
            {experience.map((exp, index) => (
              <div key={index} style={{
                marginBottom: '15px',
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
            }}>EDUCATION</div>
            {education.map((edu, index) => (
              <div key={index} style={{
                marginBottom: '12px',
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
            }}>PROJECTS</div>
            {projects.map((project, index) => (
              <div key={index} style={{
                marginBottom: '12px',
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
              margin: '20px 0 10px 0',
              borderBottom: '2px solid #000',
              paddingBottom: '5px',
              pageBreakAfter: 'avoid'
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
  
  // Elegant Professional Template (Medium tier)
  if (isElegantTemplate) {
    return (
      <div style={{
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.45',
        color: '#2d3748',
        background: 'white',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          overflowY: 'auto',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}>
          
          {/* Header Section with Modern Design */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px 30px',
            borderRadius: '15px',
            marginBottom: '25px',
            color: 'white',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '28pt',
              fontWeight: '300',
              margin: '0 0 8px 0',
              letterSpacing: '1px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>{fullName}</h1>
            
            {personalInfo?.title && (
              <div style={{
                fontSize: '14pt',
                fontWeight: '400',
                margin: '0 0 15px 0',
                opacity: '0.9',
                letterSpacing: '0.5px'
              }}>{personalInfo.title}</div>
            )}
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              fontSize: '10pt',
              marginTop: '15px'
            }}>
              {personalInfo?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📧</span>
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📱</span>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo?.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌐</span>
                  <span>{personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '25px',
            alignItems: 'start'
          }}>
            
            {/* Left Column */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              
              {/* Summary */}
              {personalInfo?.summary && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 12px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Professional Summary</h2>
                  <p style={{
                    fontSize: '10pt',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    margin: '0',
                    textAlign: 'justify'
                  }}>{personalInfo.summary}</p>
                </div>
              )}

              {/* Skills */}
              {skills && skills.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 12px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Skills</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((skill, index) => (
                      <span key={index} style={{
                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                        color: '#4a5568',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '9pt',
                        fontWeight: '500',
                        border: '1px solid #cbd5e1'
                      }}>{skill.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 12px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Languages</h2>
                  {languages.map((lang, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: '10pt', fontWeight: '500', color: '#2d3748' }}>{lang.name}</span>
                      <span style={{
                        fontSize: '9pt',
                        color: '#667eea',
                        fontWeight: '600',
                        backgroundColor: '#e6fffa',
                        padding: '3px 8px',
                        borderRadius: '10px'
                      }}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 12px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Certifications</h2>
                  {certifications.map((cert, index) => (
                    <div key={index} style={{
                      marginBottom: '12px',
                      padding: '10px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '10pt', fontWeight: '600', color: '#2d3748', marginBottom: '4px' }}>
                        {cert.name}
                      </div>
                      <div style={{ fontSize: '9pt', color: '#667eea', fontWeight: '500' }}>
                        {cert.issuer}
                      </div>
                      {cert.date && (
                        <div style={{ fontSize: '8pt', color: '#718096', marginTop: '4px' }}>
                          {cert.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              
              {/* Experience */}
              {experience && experience.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 15px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Professional Experience</h2>
                  {experience.map((exp, index) => (
                    <div key={index} style={{
                      marginBottom: '20px',
                      padding: '15px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '11pt',
                            fontWeight: '600',
                            color: '#2d3748',
                            margin: '0 0 4px 0'
                          }}>{exp.position}</h3>
                          <div style={{
                            fontSize: '10pt',
                            color: '#667eea',
                            fontWeight: '500'
                          }}>{exp.company}</div>
                        </div>
                        <div style={{
                          fontSize: '9pt',
                          color: '#718096',
                          fontWeight: '500',
                          textAlign: 'right'
                        }}>
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </div>
                      </div>
                      {exp.description && (
                        <div style={{
                          fontSize: '9pt',
                          lineHeight: '1.5',
                          color: '#4a5568',
                          marginTop: '8px',
                          textAlign: 'justify'
                        }}>{exp.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 15px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Education</h2>
                  {education.map((edu, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '10pt',
                            fontWeight: '600',
                            color: '#2d3748',
                            margin: '0 0 4px 0'
                          }}>{edu.degree}</h3>
                          <div style={{
                            fontSize: '9pt',
                            color: '#667eea',
                            fontWeight: '500'
                          }}>{edu.institution}</div>
                        </div>
                        <div style={{
                          fontSize: '8pt',
                          color: '#718096',
                          fontWeight: '500'
                        }}>{edu.endDate || edu.startDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects && projects.length > 0 && (
                <div style={{ marginBottom: '25px' }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '600',
                    color: '#667eea',
                    margin: '0 0 15px 0',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}>Projects</h2>
                  {projects.map((project, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h3 style={{
                        fontSize: '10pt',
                        fontWeight: '600',
                        color: '#2d3748',
                        margin: '0 0 6px 0'
                      }}>{project.name}</h3>
                      {project.description && (
                        <div style={{
                          fontSize: '9pt',
                          lineHeight: '1.5',
                          color: '#4a5568',
                          textAlign: 'justify'
                        }}>{project.description}</div>
                      )}
                      {project.url && (
                        <div style={{ fontSize: '8pt', color: '#667eea', marginTop: '6px' }}>
                          🔗 {project.url}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Executive Elite Template (Premium tier)
  if (isExecutiveTemplate) {
    return (
      <div style={{
        fontFamily: 'Georgia, Times, serif',
        fontSize: '11pt',
        lineHeight: '1.4',
        color: '#1a202c',
        background: 'white',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          overflowY: 'auto',
          padding: '25px',
          background: '#fafafa',
          scrollbarWidth: 'thin',
          scrollbarColor: '#a0aec0 #f7fafc'
        }}>
          
          {/* Premium Header with Gold Accent */}
          <div style={{
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
            padding: '30px 35px',
            borderRadius: '0',
            marginBottom: '30px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Gold accent bar */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '6px',
              background: 'linear-gradient(90deg, #d4af37 0%, #ffd700 50%, #d4af37 100%)'
            }}></div>
            
            <div style={{ textAlign: 'center' }}>
              <h1 style={{
                fontSize: '32pt',
                fontWeight: '400',
                margin: '0 0 8px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'Georgia, serif'
              }}>{fullName}</h1>
              
              {personalInfo?.title && (
                <div style={{
                  fontSize: '16pt',
                  fontWeight: '300',
                  margin: '0 0 20px 0',
                  letterSpacing: '1px',
                  color: '#d4af37',
                  fontStyle: 'italic'
                }}>{personalInfo.title}</div>
              )}
              
              <div style={{
                width: '80px',
                height: '2px',
                background: '#d4af37',
                margin: '0 auto 20px auto'
              }}></div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                fontSize: '10pt',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                {personalInfo?.email && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '25px',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}>
                    <span style={{ color: '#d4af37' }}>✉</span>
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo?.phone && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '25px',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}>
                    <span style={{ color: '#d4af37' }}>☎</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo?.website && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '25px',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}>
                    <span style={{ color: '#d4af37' }}>🌐</span>
                    <span>{personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {personalInfo?.summary && (
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '0',
              marginBottom: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              borderTop: '4px solid #d4af37'
            }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: '400',
                color: '#1a202c',
                margin: '0 0 15px 0',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'Georgia, serif'
              }}>Executive Summary</h2>
              <p style={{
                fontSize: '11pt',
                lineHeight: '1.7',
                color: '#2d3748',
                margin: '0',
                textAlign: 'justify',
                fontStyle: 'italic'
              }}>{personalInfo.summary}</p>
            </div>
          )}

          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2.5fr 1fr',
            gap: '25px',
            alignItems: 'start'
          }}>
            
            {/* Left Column - Main Content */}
            <div>
              
              {/* Professional Experience */}
              {experience && experience.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '0',
                  marginBottom: '25px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '16pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 20px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Professional Experience</h2>
                  {experience.map((exp, index) => (
                    <div key={index} style={{
                      marginBottom: '25px',
                      paddingBottom: '20px',
                      borderBottom: index !== experience.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px'
                      }}>
                        <div style={{ flex: '1' }}>
                          <h3 style={{
                            fontSize: '13pt',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: '0 0 5px 0',
                            fontFamily: 'Georgia, serif'
                          }}>{exp.position}</h3>
                          <div style={{
                            fontSize: '11pt',
                            color: '#d4af37',
                            fontWeight: '500',
                            fontStyle: 'italic'
                          }}>{exp.company}</div>
                        </div>
                        <div style={{
                          fontSize: '10pt',
                          color: '#4a5568',
                          fontWeight: '500',
                          textAlign: 'right',
                          minWidth: '140px'
                        }}>
                          <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                        </div>
                      </div>
                      {exp.description && (
                        <div style={{
                          fontSize: '10pt',
                          lineHeight: '1.6',
                          color: '#2d3748',
                          marginTop: '10px',
                          textAlign: 'justify',
                          paddingLeft: '15px',
                          borderLeft: '3px solid #f7fafc'
                        }}>{exp.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '0',
                  marginBottom: '25px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '16pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 20px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Education</h2>
                  {education.map((edu, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: index !== education.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '11pt',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: '0 0 4px 0'
                          }}>{edu.degree}</h3>
                          <div style={{
                            fontSize: '10pt',
                            color: '#d4af37',
                            fontWeight: '500',
                            fontStyle: 'italic'
                          }}>{edu.institution}</div>
                        </div>
                        <div style={{
                          fontSize: '9pt',
                          color: '#4a5568',
                          fontWeight: '500'
                        }}>{edu.endDate || edu.startDate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div>
              
              {/* Core Competencies */}
              {skills && skills.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '0',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Core Competencies</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {skills.map((skill, index) => (
                      <div key={index} style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderLeft: '3px solid #d4af37',
                        fontSize: '9pt',
                        fontWeight: '500',
                        color: '#2d3748'
                      }}>{skill.name}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '0',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Languages</h2>
                  {languages.map((lang, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      padding: '8px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: '10pt', fontWeight: '500', color: '#1a202c' }}>{lang.name}</span>
                      <span style={{
                        fontSize: '8pt',
                        color: '#d4af37',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Professional Certifications */}
              {certifications && certifications.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '0',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Professional Certifications</h2>
                  {certifications.map((cert, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      paddingBottom: '12px',
                      borderBottom: index !== certifications.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <div style={{ fontSize: '10pt', fontWeight: '600', color: '#1a202c', marginBottom: '4px' }}>
                        {cert.name}
                      </div>
                      <div style={{ fontSize: '9pt', color: '#d4af37', fontWeight: '500', fontStyle: 'italic' }}>
                        {cert.issuer}
                      </div>
                      {cert.date && (
                        <div style={{ fontSize: '8pt', color: '#718096', marginTop: '4px' }}>
                          {cert.date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notable Projects */}
              {projects && projects.length > 0 && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '0',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderTop: '4px solid #d4af37'
                }}>
                  <h2 style={{
                    fontSize: '14pt',
                    fontWeight: '400',
                    color: '#1a202c',
                    margin: '0 0 15px 0',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: 'Georgia, serif'
                  }}>Notable Projects</h2>
                  {projects.map((project, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      paddingBottom: '12px',
                      borderBottom: index !== projects.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}>
                      <h3 style={{
                        fontSize: '10pt',
                        fontWeight: '600',
                        color: '#1a202c',
                        margin: '0 0 6px 0'
                      }}>{project.name}</h3>
                      {project.description && (
                        <div style={{
                          fontSize: '9pt',
                          lineHeight: '1.5',
                          color: '#2d3748',
                          textAlign: 'justify',
                          marginBottom: '6px'
                        }}>{project.description}</div>
                      )}
                      {project.url && (
                        <div style={{ fontSize: '8pt', color: '#d4af37', fontWeight: '500' }}>
                          {project.url}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
