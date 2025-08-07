'use client';

import React from 'react';
import { CVLanguage, getLabel } from '@/lib/cvLanguage';

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
    cvLanguage?: CVLanguage;
    sectionNames?: {
      personalInfo?: string;
      experience?: string;
      education?: string;
      skills?: string;
      projects?: string;
      certifications?: string;
      volunteerExperience?: string;
      languages?: string;
      awards?: string;
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
  };
}

interface CVPreviewProps {
  cv: CVData;
}

const CVPreviewA4: React.FC<CVPreviewProps> = ({ cv }) => {
  const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications, honorsAwards, testScores, recommendations, courses, sectionNames } = cv.data;

  // Helper function to get section name - use translated if available, fallback to default
  const getSectionName = (sectionKey: string, defaultName: string): string => {
    return (sectionNames as Record<string, string | undefined>)?.[sectionKey] || getLabel(sectionKey as any, cv.data.cvLanguage || 'azerbaijani') || defaultName;
  };

  // Helper function to get any translated text
  const getTranslatedText = (text: string): string => {
    return getLabel(text, cv.data.cvLanguage || 'azerbaijani');
  };

  const fullName = personalInfo?.fullName || personalInfo?.name || '';

  // Map of template IDs to template types - ALL NOW FREE
  const templateIdMap = {
    // All templates are now FREE
    'b57fdbf2-9401-41d3-8d7b-efe6340781a2': 'basic',     // Basic Template - FREE
    '89243f3c-97f0-4cac-9818-9457393bc328': 'resumonk',   // Resumonk Bold - FREE
    '12c867e5-82a4-45ce-a3f0-0d237d0f1ed4': 'modern',     // Modern Creative - FREE
    'fca43d33-c88a-413b-860d-0341cd47fa44': 'executive'   // Executive Premium - FREE
  };

  // Get template type from ID, with fallbacks for legacy template IDs
  const getTemplateType = (templateId: string): string => {
    // Check UUID mapping first
    if (templateIdMap[templateId as keyof typeof templateIdMap]) {
      return templateIdMap[templateId as keyof typeof templateIdMap];
    }

    // Fallback for name-based detection (legacy)
    if (templateId?.includes('Basic Template') || templateId === 'basic') return 'basic';
    if (templateId?.includes('Resumonk Bold') || templateId === 'resumonk-bold') return 'resumonk';
    if (templateId?.includes('Modern Creative') || templateId === 'modern') return 'modern';
    if (templateId?.includes('Executive Premium') || templateId === 'executive') return 'executive';

    // Default to basic template
    return 'basic';
  };

  const templateType = getTemplateType(cv.templateId);
  console.log('🎨 Template Preview Debug:', { templateId: cv.templateId, templateType, fullName });

  // Basic Template - Classic simple design
  if (templateType === 'basic') {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        lineHeight: '1.3',
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
          width: '794px'
        }}>
          {/* Basic Header - Simple and clean */}
          <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>
            <h1 style={{
              fontSize: '24pt',
              fontWeight: 'normal',
              color: '#000',
              margin: '0 0 5px 0'
            }}>
              {fullName}
            </h1>
            {personalInfo?.title && (
              <div style={{ fontSize: '12pt', color: '#666', marginBottom: '10px' }}>
                {personalInfo.title}
              </div>
            )}
            <div style={{ fontSize: '10pt', color: '#555' }}>
              {personalInfo?.email} | {personalInfo?.phone}
              {personalInfo?.website && ` | ${personalInfo.website}`}
            </div>
          </div>

          {/* Summary */}
          {personalInfo?.summary && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 8px 0', color: '#000' }}>
                SUMMARY
              </h2>
              <p style={{ margin: '0', fontSize: '11pt', lineHeight: '1.4' }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                WORK EXPERIENCE
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '12pt' }}>{exp.position}</strong>
                      <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>{exp.company}</div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                EDUCATION
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{edu.degree}</strong> - {edu.field}
                      <div style={{ fontStyle: 'italic' }}>{edu.institution}</div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                SKILLS
              </h2>
              <div style={{ fontSize: '11pt' }}>
                {skills.map(skill => skill.name).join(' • ')}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                LANGUAGES
              </h2>
              {languages.map((lang, index) => (
                <div key={index} style={{ marginBottom: '8px', fontSize: '11pt' }}>
                  <strong>{lang.name}</strong> - {lang.level}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                PROJECTS
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '12pt' }}>{project.name}</strong>
                      {project.url && (
                        <div style={{ fontSize: '10pt', color: '#0066cc' }}>{project.url}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {project.startDate} - {project.current ? 'Present' : project.endDate}
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ margin: '5px 0 0 0', fontSize: '10pt', color: '#555' }}>
                      <strong>Technologies:</strong> {project.technologies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                CERTIFICATIONS
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{cert.name}</strong>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{cert.issuer}</div>
                      {cert.credentialId && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>ID: {cert.credentialId}</div>
                      )}
                      {cert.url && (
                        <div style={{ fontSize: '10pt', color: '#0066cc' }}>{cert.url}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {cert.issueDate || cert.date}
                      {cert.expiryDate && ` - ${cert.expiryDate}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer Experience */}
          {volunteerExperience && volunteerExperience.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                VOLUNTEER EXPERIENCE
              </h2>
              {volunteerExperience.map((vol, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '12pt' }}>{vol.role}</strong>
                      <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>{vol.organization}</div>
                      {vol.cause && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>Cause: {vol.cause}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                    </div>
                  </div>
                  {vol.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {vol.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Publications */}
          {publications && publications.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                PUBLICATIONS
              </h2>
              {publications.map((pub, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <strong style={{ fontSize: '12pt' }}>{pub.title}</strong>
                  {pub.publisher && (
                    <div style={{ fontSize: '11pt', fontStyle: 'italic' }}>{pub.publisher}</div>
                  )}
                  {pub.date && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>{pub.date}</div>
                  )}
                  {pub.authors && pub.authors.length > 0 && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      Authors: {pub.authors.join(', ')}
                    </div>
                  )}
                  {pub.url && (
                    <div style={{ fontSize: '10pt', color: '#0066cc' }}>{pub.url}</div>
                  )}
                  {pub.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {pub.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Honors and Awards */}
          {cv.data.honorsAwards && cv.data.honorsAwards.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                HONORS & AWARDS
              </h2>
              {cv.data.honorsAwards.map((award, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{award.title}</strong>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{award.issuer}</div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {award.date}
                    </div>
                  </div>
                  {award.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {award.description}
                    </p>
                  )}
                  {award.url && (
                    <div style={{ fontSize: '10pt', color: '#0066cc' }}>{award.url}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Test Scores */}
          {cv.data.testScores && cv.data.testScores.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                TEST SCORES
              </h2>
              {cv.data.testScores.map((score, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{score.testName}</strong>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {score.date}
                    </div>
                  </div>
                  <div style={{ fontSize: '10pt', color: '#333' }}>
                    Score: {score.score}
                  </div>
                  {score.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {score.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {cv.data.recommendations && cv.data.recommendations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                RECOMMENDATIONS
              </h2>
              {cv.data.recommendations.map((rec, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{rec.recommenderName}</strong>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{rec.recommenderTitle} at {rec.recommenderCompany}</div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {rec.date}
                    </div>
                  </div>
                  {rec.text && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      "{rec.text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Courses */}
          {cv.data.courses && cv.data.courses.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000' }}>
                COURSES
              </h2>
              {cv.data.courses.map((course, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{course.name}</strong>
                      <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{course.institution}</div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      {course.completionDate}
                    </div>
                  </div>
                  {course.description && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '10pt', lineHeight: '1.3' }}>
                      {course.description}
                    </p>
                  )}
                  {course.certificate && (
                    <div style={{ fontSize: '10pt', color: '#333' }}>
                      Certificate awarded
                    </div>
                  )}
                  {course.url && (
                    <div style={{ fontSize: '10pt', color: '#0066cc' }}>{course.url}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Resumonk Bold Template - Bold headers and modern styling
  if (templateType === 'resumonk') {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
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
          width: '794px'
        }}>
          {/* Bold Header with accent color */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '20px',
            marginBottom: '25px',
            borderRadius: '8px'
          }}>
            <h1 style={{
              fontSize: '28pt',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {fullName}
            </h1>
            {personalInfo?.title && (
              <div style={{ fontSize: '14pt', marginBottom: '12px', opacity: '0.9' }}>
                {personalInfo.title}
              </div>
            )}
            <div style={{ fontSize: '11pt', opacity: '0.8' }}>
              {personalInfo?.email} | {personalInfo?.phone}
              {personalInfo?.website && ` | ${personalInfo.website}`}
            </div>
          </div>

          {/* Summary with bold styling */}
          {personalInfo?.summary && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                PROFESSIONAL SUMMARY
              </h2>
              <p style={{ margin: '0', fontSize: '11pt', lineHeight: '1.5' }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience with bold styling */}
          {experience && experience.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 15px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                WORK EXPERIENCE
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{
                  marginBottom: '20px',
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0', color: '#1f2937' }}>
                        {exp.position}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#2563eb' }}>
                        {exp.company}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: 'white',
                      backgroundColor: '#2563eb',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education with bold styling */}
          {education && education.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 15px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                EDUCATION
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {edu.degree} - {edu.field}
                      </h3>
                      <div style={{ fontSize: '11pt', color: '#2563eb', fontWeight: '600' }}>
                        {edu.institution}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills with bold styling */}
          {skills && skills.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                SKILLS
              </h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {skills.map((skill, index) => (
                  <span key={index} style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '10pt',
                    fontWeight: '500'
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                LANGUAGES
              </h2>
              {languages.map((lang, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                      {lang.name}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {lang.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#2563eb',
                textTransform: 'uppercase',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px'
              }}>
                PROJECTS
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {project.name}
                      </h3>
                      {project.url && (
                        <div style={{ fontSize: '10pt', color: '#000' }}>
                          {project.url}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: '#666',
                      backgroundColor: '#000',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {project.startDate} - {project.current ? 'Present' : project.endDate}
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ margin: '8px 0 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {project.technologies.map((tech, i) => (
                        <span key={i} style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          fontSize: '9pt',
                          fontWeight: '500'
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                CERTIFICATIONS
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {cert.name}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {cert.issuer}
                      </div>
                      {cert.credentialId && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>ID: {cert.credentialId}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {cert.issueDate || cert.date}
                      {cert.expiryDate && ` - ${cert.expiryDate}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer Experience */}
          {volunteerExperience && volunteerExperience.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                VOLUNTEER EXPERIENCE
              </h2>
              {volunteerExperience.map((vol, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {vol.role}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#2563eb' }}>
                        {vol.organization}
                      </div>
                      {vol.cause && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>Cause: {vol.cause}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: 'white',
                      backgroundColor: '#2563eb',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                    </div>
                  </div>
                  {vol.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {vol.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Publications */}
          {publications && publications.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                PUBLICATIONS
              </h2>
              {publications.map((pub, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                    {pub.title}
                  </h3>
                  {pub.publisher && (
                    <div style={{ fontSize: '12pt', fontWeight: '600', color: '#333' }}>
                      {pub.publisher}
                    </div>
                  )}
                  {pub.date && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>{pub.date}</div>
                  )}
                  {pub.authors && pub.authors.length > 0 && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      Authors: {pub.authors.join(', ')}
                    </div>
                  )}
                  {pub.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {pub.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Honors and Awards */}
          {honorsAwards && honorsAwards.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                HONORS & AWARDS
              </h2>
              {honorsAwards.map((award, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {award.title}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {award.issuer}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {award.date}
                    </div>
                  </div>
                  {award.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {award.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Test Scores */}
          {testScores && testScores.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                TEST SCORES
              </h2>
              {testScores.map((score, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {score.testName}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        Score: {score.score}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {score.date}
                    </div>
                  </div>
                  {score.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {score.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                RECOMMENDATIONS
              </h2>
              {recommendations.map((rec, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {rec.recommenderName}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#333' }}>
                        {rec.recommenderTitle} at {rec.recommenderCompany}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {rec.date}
                    </div>
                  </div>
                  {rec.text && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      "{rec.text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Courses */}
          {courses && courses.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                COURSES
              </h2>
              {courses.map((course, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {course.name}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {course.institution}
                      </div>
                      {course.certificate && (
                        <div style={{ fontSize: '10pt', color: '#16a34a' }}>Certificate awarded</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {course.completionDate}
                    </div>
                  </div>
                  {course.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {course.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Executive Premium Template - Sophisticated and elegant design
  if (templateType === 'executive') {
    return (
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: '11pt',
        lineHeight: '1.6',
        color: '#333',
        background: 'white',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          overflowY: 'auto',
          padding: '25px',
          width: '794px'
        }}>
          {/* Executive Header - Elegant and professional */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '26pt',
              fontWeight: 'bold',
              color: '#000',
              margin: '0 0 10px 0',
              borderBottom: '3px solid #000',
              paddingBottom: '5px'
            }}>
              {fullName}
            </h1>
            {personalInfo?.title && (
              <div style={{ fontSize: '14pt', color: '#555', marginBottom: '15px' }}>
                {personalInfo.title}
              </div>
            )}
            <div style={{ fontSize: '11pt', color: '#777' }}>
              {personalInfo?.email} | {personalInfo?.phone}
              {personalInfo?.website && ` | ${personalInfo.website}`}
            </div>
          </div>

          {/* Summary */}
          {personalInfo?.summary && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                PROFESSIONAL SUMMARY
              </h2>
              <p style={{ margin: '0', fontSize: '11pt', lineHeight: '1.5', textAlign: 'justify' }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                WORK EXPERIENCE
              </h2>
              {experience.map((exp, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {exp.position}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#333' }}>
                        {exp.company}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: 'white',
                      backgroundColor: '#111',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#000',
                borderBottom: '2px solid #000',
                paddingBottom: '5px'
              }}>
                EDUCATION
              </h2>
              {education.map((edu, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {edu.degree} - {edu.field}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {edu.institution}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                SKILLS
              </h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {skills.map((skill, index) => (
                  <span key={index} style={{
                    backgroundColor: '#111',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '10pt',
                    fontWeight: '500'
                  }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                LANGUAGES
              </h2>
              {languages.map((lang, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                      {lang.name}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {lang.level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                PROJECTS
              </h2>
              {projects.map((project, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {project.name}
                      </h3>
                      {project.url && (
                        <div style={{ fontSize: '10pt', color: '#111' }}>
                          {project.url}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: '#666',
                      backgroundColor: '#111',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {project.startDate} - {project.current ? 'Present' : project.endDate}
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div style={{ margin: '8px 0 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {project.technologies.map((tech, i) => (
                        <span key={i} style={{
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          fontSize: '9pt',
                          fontWeight: '500'
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                CERTIFICATIONS
              </h2>
              {certifications.map((cert, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {cert.name}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {cert.issuer}
                      </div>
                      {cert.credentialId && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>ID: {cert.credentialId}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {cert.issueDate || cert.date}
                      {cert.expiryDate && ` - ${cert.expiryDate}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Volunteer Experience */}
          {volunteerExperience && volunteerExperience.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                VOLUNTEER EXPERIENCE
              </h2>
              {volunteerExperience.map((vol, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {vol.role}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#2563eb' }}>
                        {vol.organization}
                      </div>
                      {vol.cause && (
                        <div style={{ fontSize: '10pt', color: '#666' }}>Cause: {vol.cause}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '10pt',
                      color: 'white',
                      backgroundColor: '#2563eb',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                    </div>
                  </div>
                  {vol.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {vol.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Publications */}
          {publications && publications.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                PUBLICATIONS
              </h2>
              {publications.map((pub, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                    {pub.title}
                  </h3>
                  {pub.publisher && (
                    <div style={{ fontSize: '12pt', fontWeight: '600', color: '#333' }}>
                      {pub.publisher}
                    </div>
                  )}
                  {pub.date && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>{pub.date}</div>
                  )}
                  {pub.authors && pub.authors.length > 0 && (
                    <div style={{ fontSize: '10pt', color: '#666' }}>
                      Authors: {pub.authors.join(', ')}
                    </div>
                  )}
                  {pub.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {pub.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Honors and Awards */}
          {honorsAwards && honorsAwards.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                HONORS & AWARDS
              </h2>
              {honorsAwards.map((award, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {award.title}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {award.issuer}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {award.date}
                    </div>
                  </div>
                  {award.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {award.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Test Scores */}
          {testScores && testScores.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                TEST SCORES
              </h2>
              {testScores.map((score, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {score.testName}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        Score: {score.score}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {score.date}
                    </div>
                  </div>
                  {score.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {score.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                RECOMMENDATIONS
              </h2>
              {recommendations.map((rec, index) => (
                <div key={index} style={{
                  marginBottom: '25px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 5px 0', color: '#1f2937' }}>
                        {rec.recommenderName}
                      </h3>
                      <div style={{ fontSize: '12pt', fontWeight: '600', color: '#333' }}>
                        {rec.recommenderTitle} at {rec.recommenderCompany}
                      </div>
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {rec.date}
                    </div>
                  </div>
                  {rec.text && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      "{rec.text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Courses */}
          {courses && courses.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{
                fontSize: '16pt',
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                color: '#111',
                borderBottom: '3px solid #111',
                paddingBottom: '6px'
              }}>
                COURSES
              </h2>
              {courses.map((course, index) => (
                <div key={index} style={{
                  marginBottom: '15px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 3px 0' }}>
                        {course.name}
                      </h3>
                      <div style={{ fontSize: '12pt', color: '#333', fontWeight: '600' }}>
                        {course.institution}
                      </div>
                      {course.certificate && (
                        <div style={{ fontSize: '10pt', color: '#16a34a' }}>Certificate awarded</div>
                      )}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#666', fontWeight: '500' }}>
                      {course.completionDate}
                    </div>
                  </div>
                  {course.description && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '10pt', lineHeight: '1.4' }}>
                      {course.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CVPreviewA4;
