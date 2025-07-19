import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { CVData, Experience, Education, Skill, Language, Project, Certification } from '@/types/cv';
import fs from 'fs';
import path from 'path';

interface FileGenerationOptions {
  format: 'pdf' | 'docx';
  cvData: any;
  templateId?: string;
}

export class FileGenerationService {
  private static async generatePDF(cvData: any, templateId?: string): Promise<Buffer> {
    // Vercel üçün xüsusi Puppeteer konfiqurasiyası
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
    
    let browser;
    try {
      if (isVercel) {
        // Vercel-də @sparticuz/chromium istifadə et
        browser = await puppeteerCore.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
        // Local development üçün standart konfiqurasiya
        browser = await puppeteer.launch({
          headless: true,
          executablePath: '/usr/bin/google-chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
      }

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
          top: '0.25in',
          bottom: '0.25in',
          left: '0.25in',
          right: '0.25in',
        },
      });

      return Buffer.from(pdf);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('PDF yaradılarkən xəta baş verdi');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private static generateHTMLContent(cvData: any, templateId?: string): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cvData;
    
    // Check if it's Bold template
    const isBoldTemplate = templateId === 'resumonk-bold' || templateId === 'Bold';
    
    if (isBoldTemplate) {
      return this.generateBoldTemplate(cvData);
    }
    
    return this.generateBasicTemplate(cvData);
  }

  private static generateBoldTemplate(cvData: any): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cvData;
    
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
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #333;
            background: white;
            padding: 12px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        /* Header - Bold style */
        .header {
            text-align: left;
            margin-bottom: 20px;
        }
        
        .name {
            font-size: 24pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 3px;
            text-transform: uppercase;
        }
        
        .title {
            font-size: 12pt;
            color: #666;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        /* Contact Info - Table style like Resumonk */
        .contact-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .contact-table td {
            padding: 3px 8px;
            border: 1px solid #ddd;
            font-size: 9pt;
        }
        
        .contact-table td:first-child {
            font-weight: bold;
            background: #f8f8f8;
            width: 20%;
        }
        
        /* Section Headers - Bold uppercase */
        .section-header {
            font-size: 12pt;
            font-weight: bold;
            color: #000;
            text-transform: uppercase;
            margin: 15px 0 8px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 3px;
            page-break-after: avoid;
        }
        
        /* Experience Items */
        .experience-item {
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3px;
        }
        
        .company-name {
            font-size: 11pt;
            font-weight: bold;
            color: #000;
        }
        
        .position-title {
            font-size: 10pt;
            font-style: italic;
            color: #333;
            margin-bottom: 3px;
        }
        
        .date-range {
            font-size: 9pt;
            color: #666;
            font-style: italic;
        }
        
        .description {
            margin-top: 5px;
            font-size: 9pt;
            line-height: 1.3;
        }
        
        .description ul {
            margin-left: 15px;
            margin-top: 3px;
        }
        
        .description li {
            margin-bottom: 2px;
        }
        
        /* Education */
        .education-item {
            margin-bottom: 8px;
            page-break-inside: avoid;
        }
        
        .institution-name {
            font-size: 11pt;
            font-weight: bold;
            color: #000;
        }
        
        .degree-title {
            font-size: 10pt;
            color: #333;
            margin-bottom: 3px;
        }
        
        /* Skills */
        .skills-content {
            font-size: 9pt;
            line-height: 1.4;
        }
        
        /* Languages */
        .languages-content {
            font-size: 9pt;
            line-height: 1.4;
        }
        
        /* Projects */
        .project-item {
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        
        .project-name {
            font-size: 11pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 3px;
        }
        
        .project-description {
            font-size: 9pt;
            line-height: 1.3;
            margin-bottom: 3px;
        }
        
        .project-technologies {
            font-size: 8pt;
            color: #666;
            font-style: italic;
        }
        
        /* Certifications */
        .certification-item {
            margin-bottom: 8px;
            page-break-inside: avoid;
        }
        
        .certification-name {
            font-size: 10pt;
            font-weight: bold;
            color: #000;
        }
        
        .certification-issuer {
            font-size: 11pt;
            color: #666;
        }
        
        /* Summary */
        .summary {
            font-size: 11pt;
            line-height: 1.5;
            margin-bottom: 20px;
            text-align: justify;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="name">${personalInfo.fullName || ''}</div>
            ${personalInfo.title ? `<div class="title">${personalInfo.title}</div>` : ''}
        </div>

        <!-- Contact Information Table -->
        <table class="contact-table">
            ${personalInfo.phone ? `
                <tr>
                    <td>Phone:</td>
                    <td>${personalInfo.phone}</td>
                </tr>
            ` : ''}
            ${personalInfo.email ? `
                <tr>
                    <td>Email:</td>
                    <td>${personalInfo.email}</td>
                </tr>
            ` : ''}
            ${personalInfo.website ? `
                <tr>
                    <td>Website:</td>
                    <td>${personalInfo.website}</td>
                </tr>
            ` : ''}
            ${personalInfo.linkedin ? `
                <tr>
                    <td>LinkedIn:</td>
                    <td>${personalInfo.linkedin}</td>
                </tr>
            ` : ''}
            ${personalInfo.location ? `
                <tr>
                    <td>Location:</td>
                    <td>${personalInfo.location}</td>
                </tr>
            ` : ''}
        </table>

        <!-- Summary -->
        ${personalInfo.summary ? `
            <div class="summary">
                ${personalInfo.summary}
            </div>
        ` : ''}

        <!-- Experience -->
        ${experience && experience.length > 0 ? `
            <div class="section-header">EXPERIENCE</div>
            ${experience.map((exp: any) => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div>
                            <div class="company-name">${exp.company || ''}</div>
                            <div class="position-title">${exp.position || ''}</div>
                        </div>
                        <div class="date-range">
                            ${exp.startDate || ''} - ${exp.endDate ? exp.endDate : (exp.current ? 'Present' : '')}
                        </div>
                    </div>
                    ${exp.description ? `
                        <div class="description">
                            ${exp.description.split('\n').map((line: string) => 
                                line.trim().startsWith('•') || line.trim().startsWith('-') ? 
                                `<li>${line.replace(/^[•-]\s*/, '')}</li>` : 
                                line.trim() ? `<p>${line}</p>` : ''
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        ` : ''}

        <!-- Education -->
        ${education && education.length > 0 ? `
            <div class="section-header">EDUCATION</div>
            ${education.map((edu: any) => `
                <div class="education-item">
                    <div class="institution-name">${edu.institution || ''}</div>
                    <div class="degree-title">${edu.degree || ''}</div>
                    <div class="date-range">
                        ${edu.startDate || ''} - ${edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}
                    </div>
                    ${edu.gpa ? `<div class="date-range">GPA: ${edu.gpa}</div>` : ''}
                    ${edu.description ? `<div class="description">${edu.description}</div>` : ''}
                </div>
            `).join('')}
        ` : ''}

        <!-- Skills -->
        ${skills && skills.length > 0 ? `
            <div class="section-header">SKILLS</div>
            <div class="skills-content">
                ${skills.map((skill: any) => skill.name || skill.skill || '').join(', ')}
            </div>
        ` : ''}

        <!-- Languages -->
        ${languages && languages.length > 0 ? `
            <div class="section-header">LANGUAGES</div>
            <div class="languages-content">
                ${languages.map((lang: any) => `${lang.language || lang.name || ''}: ${lang.level || ''}`).join(', ')}
            </div>
        ` : ''}

        <!-- Projects -->
        ${projects && projects.length > 0 ? `
            <div class="section-header">PROJECTS</div>
            ${projects.map((project: any) => `
                <div class="project-item">
                    <div class="project-name">${project.name || ''}</div>
                    ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                    ${project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 ? `
                        <div class="project-technologies">Technologies: ${project.technologies.join(', ')}</div>
                    ` : ''}
                </div>
            `).join('')}
        ` : ''}

        <!-- Certifications -->
        ${certifications && certifications.length > 0 ? `
            <div class="section-header">CERTIFICATIONS</div>
            ${certifications.map((cert: any) => `
                <div class="certification-item">
                    <div class="certification-name">${cert.name || ''}</div>
                    <div class="certification-issuer">${cert.issuer || ''} | ${cert.date || ''}</div>
                </div>
            `).join('')}
        ` : ''}

        <!-- Volunteer Experience -->
        ${volunteerExperience && volunteerExperience.length > 0 ? `
            <div class="section-header">VOLUNTEER EXPERIENCE</div>
            ${volunteerExperience.map((vol: any) => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div>
                            <div class="company-name">${vol.organization || ''}</div>
                            <div class="position-title">${vol.role || ''}</div>
                        </div>
                        <div class="date-range">
                            ${vol.startDate || ''} - ${vol.current ? 'Present' : vol.endDate || ''}
                        </div>
                    </div>
                    ${vol.description ? `<div class="description">${vol.description}</div>` : ''}
                </div>
            `).join('')}
        ` : ''}

        <!-- Publications -->
        ${publications && publications.length > 0 ? `
            <div class="section-header">PUBLICATIONS</div>
            ${publications.map((pub: any) => `
                <div class="project-item">
                    <div class="project-name">${pub.title || ''}</div>
                    ${pub.publisher ? `<div class="certification-issuer">${pub.publisher} | ${pub.date || ''}</div>` : ''}
                    ${pub.description ? `<div class="project-description">${pub.description}</div>` : ''}
                    ${pub.url ? `<div class="project-technologies">URL: ${pub.url}</div>` : ''}
                </div>
            `).join('')}
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  private static generateBasicTemplate(cvData: any): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cvData;
    
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
            font-family: 'Times New Roman', serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #333;
            background: white;
        }
        .container {
            width: 794px;
            min-height: 1123px;
            margin: 0 auto;
            padding: 12px 16px 16px 16px;
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
        
        .cv-skill-category-title {
            font-size: 9pt;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
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
        
        .cv-project-technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            margin-bottom: 0.3rem;
        }
        
        .cv-project-tech {
            background: #dbeafe;
            color: #1e40af;
            padding: 0.2rem 0.4rem;
            border-radius: 0.2rem;
            font-size: 8pt;
            font-weight: 500;
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
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
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
            
            ${personalInfo.summary ? `
                <div class="cv-section">
                    <div class="cv-section-header">
                        <h2 class="cv-section-title">Summary</h2>
                    </div>
                    <p>${personalInfo.summary}</p>
                </div>
            ` : ''}
        </div>

        ${experience && experience.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Work Experience</h2>
                </div>
                ${experience.map((exp: any) => `
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
        ` : ''}

        ${education && education.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Education</h2>
                </div>
                ${education.map((edu: any) => `
                    <div class="cv-education-item">
                        <div class="cv-education-degree">${edu.degree || ''}</div>
                        <div class="cv-education-institution">${edu.institution || ''}</div>
                        <div class="cv-experience-date">
                            ${edu.startDate || ''} - ${edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${skills && skills.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Skills</h2>
                </div>
                <div class="cv-skills-grid">
                    ${skills.map((skill: any) => `
                        <div class="cv-skill-item">
                            <span class="cv-skill-name">${skill.name || skill.skill || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${languages && languages.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Languages</h2>
                </div>
                <div class="cv-languages-grid">
                    ${languages.map((lang: any) => `
                        <div class="cv-language-item">
                            <span class="cv-language-name">${lang.language || lang.name || ''}</span>
                            <span class="cv-language-level">${lang.level || ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${projects && projects.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Projects</h2>
                </div>
                ${projects.map((project: any) => `
                    <div class="cv-project-item">
                        <div class="cv-project-title">${project.name || ''}</div>
                        ${project.description ? `<div class="cv-project-description">${project.description}</div>` : ''}
                        ${project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 ? `
                            <div class="cv-project-technologies">
                                ${project.technologies.map((tech: any) => `<span class="cv-project-tech">${tech || ''}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${certifications && certifications.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Certifications</h2>
                </div>
                ${certifications.map((cert: any) => `
                    <div class="cv-certification-item">
                        <div class="cv-certification-name">${cert.name || ''}</div>
                        <div class="cv-certification-issuer">${cert.issuer || ''}</div>
                        <div class="cv-certification-date">${cert.date || ''}</div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${volunteerExperience && volunteerExperience.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Volunteer Experience</h2>
                </div>
                ${volunteerExperience.map((vol: any) => `
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
        ` : ''}

        ${publications && publications.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-header">
                    <h2 class="cv-section-title">Publications</h2>
                </div>
                ${publications.map((pub: any) => `
                    <div class="cv-experience-item">
                        <div class="cv-experience-header">
                            <div>
                                <div class="cv-experience-title">${pub.title || ''}</div>
                                ${pub.publisher ? `<div class="cv-experience-company">${pub.publisher}</div>` : ''}
                                ${pub.authors && pub.authors.length > 0 ? `
                                    <div class="cv-experience-location">Authors: ${pub.authors.join(', ')}</div>
                                ` : ''}
                            </div>
                            ${pub.date ? `<div class="cv-experience-date">${pub.date}</div>` : ''}
                        </div>
                        ${pub.description ? `<div class="cv-experience-description">${pub.description}</div>` : ''}
                        ${pub.url ? `
                            <div class="cv-experience-location">
                                <a href="${pub.url}" target="_blank" rel="noopener noreferrer">${pub.url}</a>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
</body>
</html>
    `;
  }

  private static async generateDOCX(cvData: any, templateId?: string): Promise<Buffer> {
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
                  bold: true,
                  size: 36,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            
            // Contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            
            // Summary
            ...(personalInfo.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SUMMARY",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: personalInfo.summary,
                    size: 20,
                  }),
                ],
              }),
            ] : []),
            
            // Experience
            ...(experience && experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "WORK EXPERIENCE",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...experience.flatMap((exp: any) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.position,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${exp.company} | ${exp.startDate} - ${exp.endDate ? exp.endDate : (exp.current ? 'Present' : '')}`,
                      size: 20,
                    }),
                  ],
                }),
                ...(exp.description ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: exp.description,
                        size: 20,
                      }),
                    ],
                  }),
                ] : []),
              ]),
            ] : []),
            
            // Education
            ...(education && education.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "EDUCATION",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...education.flatMap((edu: any) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.institution} | ${edu.startDate} - ${edu.endDate ? edu.endDate : (edu.current ? 'Present' : '')}`,
                      size: 20,
                    }),
                  ],
                }),
              ]),
            ] : []),
            
            // Skills
            ...(skills && skills.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SKILLS",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...skills.flatMap((skill: any) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: skill.name || skill.skill || '',
                      size: 20,
                    }),
                  ],
                }),
              ]),
            ] : []),
            
            // Languages
            ...(languages && languages.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "LANGUAGES",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: languages.map((lang: any) => `${lang.language || lang.name}: ${lang.level}`).join(', '),
                    size: 20,
                  }),
                ],
              }),
            ] : []),
            
            // Projects
            ...(projects && projects.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROJECTS",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...projects.flatMap((project: any) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: project.name,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                ...(project.description ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: project.description,
                        size: 20,
                      }),
                    ],
                  }),
                ] : []),
                ...(project.technologies && project.technologies.length > 0 ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Technologies: ${project.technologies.join(', ')}`,
                        size: 18,
                      }),
                    ],
                  }),
                ] : []),
              ]),
            ] : []),
            
            // Certifications
            ...(certifications && certifications.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "CERTIFICATIONS",
                    bold: true,
                    size: 24,
                  }),
                ],
                heading: HeadingLevel.HEADING_2,
              }),
              ...certifications.flatMap((cert: any) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cert.name,
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${cert.issuer} | ${cert.date}`,
                      size: 20,
                    }),
                  ],
                }),
              ]),
            ] : []),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  static async generateFile(options: FileGenerationOptions): Promise<Buffer> {
    const { format, cvData, templateId } = options;
    
    switch (format) {
      case 'pdf':
        return await this.generatePDF(cvData, templateId);
      case 'docx':
        return await this.generateDOCX(cvData, templateId);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

export default FileGenerationService;
