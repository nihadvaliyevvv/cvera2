import { NextRequest, NextResponse } from 'next/server';

// CV Preview API endpoint for PDF generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cvDataParam = searchParams.get('cvData');
    const templateId = searchParams.get('templateId') || 'professional';

    if (!cvDataParam) {
      return NextResponse.json({ error: 'CV data is required' }, { status: 400 });
    }

    let cvData;
    try {
      cvData = JSON.parse(decodeURIComponent(cvDataParam));
    } catch (error) {
      return NextResponse.json({ error: 'Invalid CV data format' }, { status: 400 });
    }

    // Generate HTML that matches the preview component exactly
    const html = generatePreviewHTML(cvData, templateId);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('CV preview API error:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}

function generatePreviewHTML(cvData: any, templateId: string): string {
  const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications, sectionOrder } = cvData;

  // Get sections in the order specified by sectionOrder, or default order
  const defaultSections = [
    { id: 'personal', type: 'personal' },
    { id: 'summary', type: 'summary' },
    { id: 'experience', type: 'experience' },
    { id: 'education', type: 'education' },
    { id: 'skills', type: 'skills' },
    { id: 'languages', type: 'languages' },
    { id: 'projects', type: 'projects' },
    { id: 'certifications', type: 'certifications' },
    { id: 'volunteerExperience', type: 'volunteerExperience' },
    { id: 'publications', type: 'publications' }
  ];

  const orderedSections = sectionOrder && sectionOrder.length > 0
    ? sectionOrder.filter((section: any) => section.enabled !== false)
    : defaultSections;

  // Generate sections HTML based on the order
  const sectionsHTML = orderedSections.map((section: any) => {
    const sectionType = section.type || section.id;

    switch (sectionType) {
      case 'personal':
        return generatePersonalSection(personalInfo);
      case 'summary':
        return personalInfo?.summary ? generateSummarySection(personalInfo.summary) : '';
      case 'experience':
        return experience && experience.length > 0 ? generateExperienceSection(experience) : '';
      case 'education':
        return education && education.length > 0 ? generateEducationSection(education) : '';
      case 'skills':
        return skills && skills.length > 0 ? generateSkillsSection(skills) : '';
      case 'languages':
        return languages && languages.length > 0 ? generateLanguagesSection(languages) : '';
      case 'projects':
        return projects && projects.length > 0 ? generateProjectsSection(projects) : '';
      case 'certifications':
        return certifications && certifications.length > 0 ? generateCertificationsSection(certifications) : '';
      case 'volunteerExperience':
        return volunteerExperience && volunteerExperience.length > 0 ? generateVolunteerSection(volunteerExperience) : '';
      case 'publications':
        return publications && publications.length > 0 ? generatePublicationsSection(publications) : '';
      default:
        return '';
    }
  }).filter(Boolean).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Preview - ${personalInfo?.fullName || 'CV'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #333;
            background: white;
            width: 794px;
            min-height: 1123px;
            margin: 0;
            padding: 12px 16px 16px 16px;
        }

        .cv-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
        }

        .cv-section {
            margin-bottom: 0.4rem;
            page-break-inside: avoid;
            break-inside: avoid;
            min-height: 25px;
        }

        .text-center {
            text-align: center;
        }

        .mb-8 {
            margin-bottom: 0.4rem;
        }

        h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.2rem;
            line-height: 1.1;
        }

        h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.15rem;
            margin-top: 0.4rem;
            padding-bottom: 0.1rem;
            border-bottom: 1px solid #e5e7eb;
        }

        p {
            margin-bottom: 0.3rem;
            color: #4b5563;
            font-size: 9pt;
        }

        .cv-contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            margin-bottom: 0.6rem;
            padding: 0.6rem;
            background: #f9fafb;
            border-radius: 0.3rem;
            justify-content: center;
        }

        .cv-contact-item {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            color: #4b5563;
            font-size: 8pt;
            font-weight: 500;
            white-space: nowrap;
        }

        .cv-section-header {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            margin-bottom: 0.3rem;
            padding-bottom: 0.2rem;
            page-break-after: avoid;
            break-after: avoid;
            border-bottom: 1px solid #e5e7eb;
        }

        .cv-section-title {
            font-size: 1rem;
            font-weight: 700;
            color: #1f2937;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .cv-experience-item {
            margin-bottom: 0.4rem;
            padding: 0.4rem;
            border-left: 2px solid #3b82f6;
            background: #f8fafc;
            border-radius: 0 0.3rem 0.3rem 0;
            page-break-inside: avoid;
            break-inside: avoid;
            min-height: 40px;
        }

        .cv-experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.25rem;
            gap: 0.6rem;
        }

        .cv-experience-title {
            font-size: 10pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.2rem;
        }

        .cv-experience-company {
            font-size: 9pt;
            font-weight: 600;
            color: #3b82f6;
            margin-bottom: 0.2rem;
        }

        .cv-experience-date {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 600;
        }

        .cv-experience-location {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 500;
            font-style: italic;
        }

        .cv-experience-description {
            color: #4b5563;
            line-height: 1.4;
            margin-top: 0.2rem;
            min-height: 20px;
            padding-top: 0.2rem;
            border-top: 1px solid #e5e7eb;
            font-size: 9pt;
        }

        .cv-education-item {
            margin-bottom: 0.4rem;
            padding: 0.4rem;
            border-left: 2px solid #10b981;
            background: #f0fdf4;
            border-radius: 0 0.3rem 0.3rem 0;
            page-break-inside: avoid;
            break-inside: avoid;
            min-height: 40px;
        }

        .cv-education-degree {
            font-size: 10pt;
            font-weight: 700;
            color: #1f2937;
        }

        .cv-education-institution {
            font-size: 9pt;
            font-weight: 600;
            color: #10b981;
            margin-bottom: 0.2rem;
        }

        .cv-skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.6rem;
            width: 100%;
            margin-top: 0.3rem;
        }

        .cv-skill-category {
            background: #f3f4f6;
            padding: 0.4rem;
            border-radius: 0.3rem;
            page-break-inside: avoid;
            break-inside: avoid;
            min-height: 40px;
        }

        .cv-skill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 0.15rem;
        }

        .cv-skill-item:last-child {
            border-bottom: none;
        }

        .cv-skill-name {
            font-weight: 600;
            color: #374151;
            font-size: 8pt;
        }

        .cv-skill-level {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 600;
        }

        .cv-languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.6rem;
            width: 100%;
        }

        .cv-language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem;
            background: #f3f4f6;
            border-radius: 0.3rem;
            margin-bottom: 0.15rem;
        }

        .cv-language-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 8pt;
        }

        .cv-language-level {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 500;
        }

        .cv-project-item {
            margin-bottom: 0.4rem;
            padding: 0.4rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.3rem;
            background: #fafafa;
            page-break-inside: avoid;
            break-inside: avoid;
            min-height: 40px;
        }

        .cv-project-title {
            font-size: 10pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.3rem;
        }

        .cv-project-description {
            color: #4b5563;
            margin-bottom: 0.5rem;
            font-size: 9pt;
        }

        .cv-certification-item {
            margin-bottom: 0.4rem;
            padding: 0.4rem;
            border-left: 2px solid #f59e0b;
            background: #fffbeb;
            border-radius: 0 0.3rem 0.3rem 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .cv-certification-name {
            font-size: 9pt;
            font-weight: 700;
            color: #1f2937;
        }

        .cv-certification-issuer {
            font-size: 8pt;
            font-weight: 600;
            color: #f59e0b;
            margin-bottom: 0.2rem;
        }

        .cv-certification-date {
            font-size: 8pt;
            color: #6b7280;
            font-weight: 500;
        }

        @media print {
            body {
                margin: 0;
                padding: 12px 16px;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .cv-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        ${sectionsHTML}
    </div>
</body>
</html>`;
}

function generatePersonalSection(personalInfo: any): string {
  if (!personalInfo) return '';

  return `
    <div class="cv-section">
        <div class="text-center mb-8">
            <h1>${personalInfo.fullName || ''}</h1>
            <div class="cv-contact-info">
                ${personalInfo.email ? `
                    <div class="cv-contact-item">
                        <span>${personalInfo.email}</span>
                    </div>
                ` : ''}
                ${personalInfo.phone ? `
                    <div class="cv-contact-item">
                        <span>${personalInfo.phone}</span>
                    </div>
                ` : ''}
                ${personalInfo.location ? `
                    <div class="cv-contact-item">
                        <span>${personalInfo.location}</span>
                    </div>
                ` : ''}
                ${personalInfo.linkedin ? `
                    <div class="cv-contact-item">
                        <span>LinkedIn: ${personalInfo.linkedin}</span>
                    </div>
                ` : ''}
                ${personalInfo.website ? `
                    <div class="cv-contact-item">
                        <span>Website: ${personalInfo.website}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    </div>
  `;
}

function generateSummarySection(summary: string): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Summary</h2>
        </div>
        <p>${summary}</p>
    </div>
  `;
}

function generateExperienceSection(experience: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Work Experience</h2>
        </div>
        ${experience.map(exp => `
            <div class="cv-experience-item">
                <div class="cv-experience-header">
                    <div>
                        <div class="cv-experience-title">${exp.position || ''}</div>
                        <div class="cv-experience-company">${exp.company || ''}</div>
                        ${exp.location ? `<div class="cv-experience-location">${exp.location}</div>` : ''}
                    </div>
                    <div class="cv-experience-date">
                        ${exp.startDate || ''} - ${exp.endDate ? exp.endDate : (exp.current ? 'Present' : '')}
                    </div>
                </div>
                ${exp.description ? `<div class="cv-experience-description">${exp.description}</div>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

function generateEducationSection(education: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Education</h2>
        </div>
        ${education.map(edu => `
            <div class="cv-education-item">
                <div class="cv-education-degree">${edu.degree || ''}</div>
                <div class="cv-education-institution">${edu.institution || ''}</div>
                <div class="cv-experience-date">
                    ${edu.startDate || ''} - ${edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}
                </div>
                ${edu.gpa ? `<div class="cv-experience-location">GPA: ${edu.gpa}</div>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

function generateSkillsSection(skills: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Skills</h2>
        </div>
        <div class="cv-skills-grid">
            ${skills.map(skill => `
                <div class="cv-skill-item">
                    <span class="cv-skill-name">${skill.name || skill.skill || ''}</span>
                    ${skill.level ? `<span class="cv-skill-level">${skill.level}</span>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
  `;
}

function generateLanguagesSection(languages: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Dillər</h2>
        </div>
        <div class="cv-languages-grid">
            ${languages.map(lang => {
              const languageName = lang.language || lang.name || '';
              const languageLevel = lang.level || lang.proficiency || '';
              
              // Translate levels to Azerbaijani
              const levelTranslations: Record<string, string> = {
                'Basic': 'Əsas',
                'Conversational': 'Danışıq',
                'Professional': 'Professional', 
                'Native': 'Ana dili'
              };
              
              const translatedLevel = levelTranslations[languageLevel as string] || languageLevel;
              
              return `
                <div class="cv-language-item">
                    <span class="cv-language-name">${languageName}</span>
                    <span class="cv-language-level">${translatedLevel}</span>
                </div>
              `;
            }).join('')}
        </div>
    </div>
  `;
}

function generateProjectsSection(projects: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Projects</h2>
        </div>
        ${projects.map(project => `
            <div class="cv-project-item">
                <div class="cv-project-title">${project.name || ''}</div>
                ${project.description ? `<div class="cv-project-description">${project.description}</div>` : ''}
                ${project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 ? `
                    <div class="cv-experience-location">Technologies: ${project.technologies.join(', ')}</div>
                ` : ''}
                ${project.url ? `<div class="cv-experience-location">URL: ${project.url}</div>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

function generateCertificationsSection(certifications: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Certifications</h2>
        </div>
        ${certifications.map(cert => `
            <div class="cv-certification-item">
                <div class="cv-certification-name">${cert.name || ''}</div>
                <div class="cv-certification-issuer">${cert.issuer || ''}</div>
                <div class="cv-certification-date">${cert.date || ''}</div>
            </div>
        `).join('')}
    </div>
  `;
}

function generateVolunteerSection(volunteerExperience: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Volunteer Experience</h2>
        </div>
        ${volunteerExperience.map(vol => `
            <div class="cv-experience-item">
                <div class="cv-experience-header">
                    <div>
                        <div class="cv-experience-title">${vol.role || ''}</div>
                        <div class="cv-experience-company">${vol.organization || ''}</div>
                        ${vol.cause ? `<div class="cv-experience-location">${vol.cause}</div>` : ''}
                    </div>
                    <div class="cv-experience-date">
                        ${vol.startDate || ''} - ${vol.current ? 'Present' : vol.endDate || ''}
                    </div>
                </div>
                ${vol.description ? `<div class="cv-experience-description">${vol.description}</div>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

function generatePublicationsSection(publications: any[]): string {
  return `
    <div class="cv-section">
        <div class="cv-section-header">
            <h2 class="cv-section-title">Publications</h2>
        </div>
        ${publications.map(pub => `
            <div class="cv-experience-item">
                <div class="cv-experience-header">
                    <div>
                        <div class="cv-experience-title">${pub.title || ''}</div>
                        ${pub.publisher ? `<div class="cv-experience-company">${pub.publisher}</div>` : ''}
                    </div>
                    ${pub.date ? `<div class="cv-experience-date">${pub.date}</div>` : ''}
                </div>
                ${pub.description ? `<div class="cv-experience-description">${pub.description}</div>` : ''}
                ${pub.url ? `<div class="cv-experience-location"><a href="${pub.url}">${pub.url}</a></div>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}
