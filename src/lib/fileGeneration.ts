import puppeteer from 'puppeteer';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { CVData, Experience, Education, Skill, Language, Project, Certification } from '@/types/cv';
import fs from 'fs';
import path from 'path';

interface FileGenerationOptions {
  format: 'pdf' | 'docx';
  cvData: CVData;
  templateId?: string;
}

export class FileGenerationService {
  private static async generatePDF(cvData: CVData, templateId?: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML content for CV
      const htmlContent = this.generateHTMLContent(cvData, templateId);
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
          right: '0.5in',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private static generateHTMLContent(cvData: CVData, templateId?: string): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications } = cvData;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CV - ${personalInfo.fullName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
        }
        .header h1 {
            font-size: 2.5rem;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9rem;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #1e40af;
            font-size: 1.5rem;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        .experience-item, .education-item, .project-item, .cert-item {
            margin-bottom: 20px;
            padding-left: 20px;
            border-left: 3px solid #3b82f6;
        }
        .experience-item h3, .education-item h3, .project-item h3, .cert-item h3 {
            color: #1f2937;
            margin-bottom: 5px;
        }
        .experience-item .company, .education-item .institution, .cert-item .issuer {
            font-weight: 600;
            color: #6b7280;
        }
        .experience-item .duration, .education-item .duration, .cert-item .date {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .experience-item .description, .project-item .description {
            margin-top: 10px;
            color: #374151;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .skill-category h4 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        .skill-list {
            list-style: none;
        }
        .skill-list li {
            padding: 3px 0;
            color: #374151;
        }
        .languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f3f4f6;
            border-radius: 6px;
        }
        .language-level {
            font-weight: 600;
            color: #3b82f6;
        }
        .projects-grid {
            display: grid;
            gap: 20px;
        }
        .project-item {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .project-item .tech-stack {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #6b7280;
        }
        .project-item .tech-stack strong {
            color: #374151;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${personalInfo.fullName}</h1>
            <div class="contact-info">
                <div class="contact-item">
                    <span>📧</span>
                    <span>${personalInfo.email}</span>
                </div>
                <div class="contact-item">
                    <span>📱</span>
                    <span>${personalInfo.phone}</span>
                </div>
                <div class="contact-item">
                    <span>📍</span>
                    <span>${personalInfo.location}</span>
                </div>
            </div>
        </div>

        ${personalInfo.summary ? `
        <div class="section">
            <h2>Haqqımda</h2>
            <p>${personalInfo.summary}</p>
        </div>
        ` : ''}

        ${experience && experience.length > 0 ? `
        <div class="section">
            <h2>Təcrübə</h2>
            ${experience.map(exp => `
                <div class="experience-item">
                    <h3>${exp.position}</h3>
                    <div class="company">${exp.company}</div>
                    <div class="duration">${exp.startDate} - ${exp.endDate || 'Hazırda'}</div>
                    ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${education && education.length > 0 ? `
        <div class="section">
            <h2>Təhsil</h2>
            ${education.map(edu => `
                <div class="education-item">
                    <h3>${edu.degree}</h3>
                    <div class="institution">${edu.institution}</div>
                    <div class="duration">${edu.startDate} - ${edu.endDate || 'Hazırda'}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${skills && skills.length > 0 ? `
        <div class="section">
            <h2>Bacarıqlar</h2>
            <div class="skills-grid">
                ${skills.map(skill => `
                    <div class="skill-category">
                        <h4>${skill.category}</h4>
                        <ul class="skill-list">
                            ${skill.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${languages && languages.length > 0 ? `
        <div class="section">
            <h2>Dillər</h2>
            <div class="languages-grid">
                ${languages.map(lang => `
                    <div class="language-item">
                        <span>${lang.language}</span>
                        <span class="language-level">${lang.level}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${projects && projects.length > 0 ? `
        <div class="section">
            <h2>Layihələr</h2>
            <div class="projects-grid">
                ${projects.map(project => `
                    <div class="project-item">
                        <h3>${project.name}</h3>
                        ${project.description ? `<div class="description">${project.description}</div>` : ''}
                        ${project.technologies && project.technologies.length > 0 ? `
                            <div class="tech-stack">
                                <strong>Texnologiyalar:</strong> ${project.technologies.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${certifications && certifications.length > 0 ? `
        <div class="section">
            <h2>Sertifikatlar</h2>
            ${certifications.map(cert => `
                <div class="cert-item">
                    <h3>${cert.name}</h3>
                    <div class="issuer">${cert.issuer}</div>
                    <div class="date">${cert.date}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  private static async generateDOCX(cvData: CVData): Promise<Buffer> {
    const { personalInfo, experience, education, skills, languages, projects, certifications } = cvData;
    
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              children: [
                new TextRun({
                  text: personalInfo.fullName,
                  size: 32,
                  bold: true,
                  color: '1e40af',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            
            // Contact Info
            new Paragraph({
              children: [
                new TextRun({
                  text: `📧 ${personalInfo.email} | 📱 ${personalInfo.phone} | 📍 ${personalInfo.location}`,
                  size: 22,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Summary
            ...(personalInfo.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Haqqımda',
                    size: 24,
                    bold: true,
                    color: '1e40af',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: personalInfo.summary,
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ] : []),

            // Experience
            ...(experience && experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Təcrübə',
                    size: 24,
                    bold: true,
                    color: '1e40af',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.position,
                      size: 22,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 100, after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${exp.company} | ${exp.startDate} - ${exp.endDate || 'Hazırda'}`,
                      size: 20,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 50 },
                }),
                ...(exp.description ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: exp.description,
                        size: 20,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                ] : []),
              ]),
            ] : []),

            // Education
            ...(education && education.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Təhsil',
                    size: 24,
                    bold: true,
                    color: '1e40af',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      size: 22,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 100, after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.institution} | ${edu.startDate} - ${edu.endDate || 'Hazırda'}`,
                      size: 20,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ]),
            ] : []),

            // Skills
            ...(skills && skills.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Bacarıqlar',
                    size: 24,
                    bold: true,
                    color: '1e40af',
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              }),
              ...skills.flatMap(skill => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: skill.category,
                      size: 22,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 100, after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: skill.items.join(', '),
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ]),
            ] : []),
          ],
        },
      ],
    });

    return Buffer.from(await Packer.toBuffer(doc));
  }

  static async generateFile(options: FileGenerationOptions): Promise<Buffer> {
    const { format, cvData } = options;
    
    if (format === 'pdf') {
      return await this.generatePDF(cvData, options.templateId);
    } else if (format === 'docx') {
      return await this.generateDOCX(cvData);
    } else {
      throw new Error('Unsupported format');
    }
  }
}

export default FileGenerationService;
