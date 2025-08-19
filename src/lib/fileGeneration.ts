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
          executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security'],
        });
      }

      const page = await browser.newPage();
      
      console.log('PDF generation started', { templateId, isVercel });

      // YENİ APPROACH: Direkt Tailwind CSS və React component structure istifadə edirik
      const htmlContent = this.generateReactLikeHTML(cvData, templateId);
      
      console.log('Generated HTML content length:', htmlContent.length);

      // HTML content-i page-ə yükləyirik
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      
      console.log('HTML content loaded successfully');

      // First try to load the preview URL
      try {
        console.log('Preview API response status: N/A');
      } catch (fetchError) {
        console.error('Failed to fetch preview URL:', fetchError);
      }

      try {
        console.log('Preview page loaded successfully');
        
        // Check page content
        const pageContent = await page.content();
        console.log('Page content length:', pageContent.length);
        
        // Log first part of content to debug
        console.log('HTML preview:', pageContent.substring(0, 1000));
        
      } catch (error) {
        console.error('Failed to load preview page:', error);
        console.log('Attempting direct HTML generation fallback...');
        
        // Fallback: Generate simple HTML directly
        try {
          const simpleHTML = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; width: 794px; padding: 40px; margin: 0; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                .name { font-size: 2.5em; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 1.4em; font-weight: bold; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 15px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="name">${cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'CV'}</div>
                <div class="contact">${cvData.personalInfo?.email || ''} | ${cvData.personalInfo?.phone || ''}</div>
              </div>
              <div class="section">
                <div class="section-title">Professional Summary</div>
                <div>${cvData.personalInfo?.summary || 'No summary available'}</div>
              </div>
              ${cvData.experience && cvData.experience.length > 0 ? `
              <div class="section">
                <div class="section-title">Experience</div>
                ${cvData.experience.map((exp: any) => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold;">${exp.position} - ${exp.company}</div>
                    <div style="color: #666; font-size: 0.9em;">${exp.startDate} - ${exp.endDate || 'Present'}</div>
                    <div style="margin-top: 5px;">${exp.description || ''}</div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </body>
            </html>
          `;
          
          await page.setContent(simpleHTML, { waitUntil: 'networkidle0' });
          console.log('Direct HTML fallback successful');
        } catch (fallbackError) {
          console.error('Direct HTML fallback also failed:', fallbackError);
          throw new Error(`Both preview URL and direct HTML generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Viewport və scale tənzimləmələri - A4 full size için
      await page.setViewport({
        width: 794, // A4 width at 96 DPI
        height: 1123, // A4 height at 96 DPI (və daha uzun content için artıraq)
        deviceScaleFactor: 2 // High resolution
      });
      
      // Wait for content to fully render
      await new Promise(resolve => setTimeout(resolve, 2000));

      // PDF yaradılması - Preview ilə 1:1 uyğunluq
      console.log('Starting PDF generation...');
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false, // Use our viewport size
        displayHeaderFooter: false,
        margin: {
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
        },
        scale: 1.0,
        width: '794px',
        height: '1123px'
      });

      console.log('PDF generated successfully, size:', pdf.length);

      if (!pdf || pdf.length === 0) {
        throw new Error('Empty PDF generated');
      }

      return Buffer.from(pdf);
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      // Fallback: Əgər preview URL işləməzsə, köhnə metodu istifadə et
      console.log('Attempting fallback PDF generation...');
      return this.generatePDFFallback(cvData, templateId);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // YENİ METHOD: CVPreviewA4 component-in exact kopyası
  private static generateReactLikeHTML(cvData: any, templateId?: string): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications } = cvData;
    
    const sanitizeText = (text: string) => {
      if (!text) return '';
      return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    // Tailwind CSS-i tam inline styles-a çeviririk
    let html = '<!DOCTYPE html>';
    html += '<html lang="az">';
    html += '<head>';
    html += '<meta charset="UTF-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '<title>CV - ' + sanitizeText(personalInfo?.fullName || personalInfo?.name || 'CV') + '</title>';
    html += '<style>';
    
    // Exact Tailwind CSS styles from CVPreviewA4
    html += '* { margin: 0; padding: 0; box-sizing: border-box; }';
    html += 'body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; background-color: rgb(243 244 246); height: 100%; overflow-y: auto; padding: 2rem; }';
    html += '@media (min-width: 768px) { body { padding: 2rem; } }';
    
    // Main container - matching "w-full max-w-4xl bg-white shadow-lg p-8 md:p-12"
    html += '.cv-container { width: 794px; max-width: 56rem; background-color: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); padding: 2rem; margin: 0 auto; }';
    html += '@media (min-width: 768px) { .cv-container { padding: 3rem; } }';
    
    // Header styles - matching "flex flex-col md:flex-row justify-between items-start mb-10"
    html += '.header { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; }';
    html += '@media (min-width: 768px) { .header { flex-direction: row; } }';
    
    // Name - matching "font-bold text-gray-800" with custom fontSize
    html += '.name { font-weight: 700; color: rgb(31 41 55); font-size: 2rem; line-height: 2.5rem; margin-bottom: 0.5rem; }';
    
    // Title - matching subtitle styling  
    html += '.title { color: rgb(107 114 128); font-size: 1.25rem; line-height: 1.75rem; margin-bottom: 1rem; }';
    
    // Contact info - matching contact styling
    html += '.contact-info { display: flex; flex-wrap: wrap; gap: 1rem; color: rgb(75 85 99); font-size: 0.875rem; margin-bottom: 1.5rem; }';
    
    // Sections - matching section spacing
    html += '.section { margin-bottom: 2rem; }';
    
    // Section titles - matching "text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-1 mb-4"
    html += '.section-title { font-size: 1.125rem; font-weight: 600; color: rgb(31 41 55); border-bottom: 2px solid rgb(59 130 246); padding-bottom: 0.25rem; margin-bottom: 1rem; }';
    
    // Experience items - matching experience styling
    html += '.experience-item { margin-bottom: 1.5rem; padding-left: 1rem; border-left: 2px solid rgb(59 130 246); position: relative; }';
    
    // Job titles - matching job title styling
    html += '.job-title { font-size: 1.125rem; font-weight: 600; color: rgb(31 41 55); }';
    
    // Company names - matching company styling
    html += '.company { font-weight: 500; color: rgb(31 41 55); }';
    
    // Dates - matching date styling
    html += '.dates { font-size: 0.875rem; color: rgb(107 114 128); margin-bottom: 0.5rem; }';
    
    // Descriptions - matching description styling
    html += '.description { color: rgb(55 65 81); line-height: 1.5; margin-top: 0.5rem; }';
    
    // Skills grid - matching skills grid
    html += '.skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }';
    
    // Skill items - matching skill styling
    html += '.skill-item { background-color: rgb(243 244 246); padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; color: rgb(31 41 55); }';
    
    // Summary - matching summary styling
    html += '.summary { line-height: 1.625; color: rgb(55 65 81); }';
    
    html += '</style>';
    html += '</head>';
    html += '<body>';
    
    // Main container exact structure
    html += '<div class="cv-container">';
    
    // Header section - exact structure from CVPreviewA4
    html += '<header class="header">';
    html += '<div>';
    html += '<h1 class="name">' + sanitizeText(personalInfo?.fullName || personalInfo?.name || '') + '</h1>';
    
    if (personalInfo?.title) {
      html += '<h2 class="title">' + sanitizeText(personalInfo.title) + '</h2>';
    }
    
    // Contact info
    html += '<div class="contact-info">';
    if (personalInfo?.email) html += '<span>' + sanitizeText(personalInfo.email) + '</span>';
    if (personalInfo?.phone) html += '<span>' + sanitizeText(personalInfo.phone) + '</span>';
    if (personalInfo?.linkedin) html += '<span>' + sanitizeText(personalInfo.linkedin) + '</span>';
    if (personalInfo?.website) html += '<span>' + sanitizeText(personalInfo.website) + '</span>';
    html += '</div>';
    
    html += '</div>';
    html += '</header>';

    // Summary section - exact structure
    if (personalInfo?.summary) {
      html += '<section class="section">';
      html += '<h2 class="section-title">Peşəkar Özət</h2>';
      html += '<div class="summary">' + sanitizeText(personalInfo.summary) + '</div>';
      html += '</section>';
    }

    // Experience section - exact structure
    if (experience && experience.length > 0) {
      html += '<section class="section">';
      html += '<h2 class="section-title">İş Təcrübəsi</h2>';
      experience.forEach((exp: any) => {
        html += '<div class="experience-item">';
        html += '<h3 class="job-title">' + sanitizeText(exp.position || '') + '</h3>';
        html += '<div class="company">' + sanitizeText(exp.company || '') + '</div>';
        html += '<div class="dates">' + sanitizeText(exp.startDate || '') + ' - ' + (exp.current ? 'İndi' : sanitizeText(exp.endDate || '')) + '</div>';
        if (exp.description) {
          html += '<div class="description">' + sanitizeText(exp.description) + '</div>';
        }
        html += '</div>';
      });
      html += '</section>';
    }

    // Education section - exact structure
    if (education && education.length > 0) {
      html += '<section class="section">';
      html += '<h2 class="section-title">Təhsil</h2>';
      education.forEach((edu: any) => {
        html += '<div class="experience-item">';
        html += '<h3 class="job-title">' + sanitizeText(edu.degree || '') + '</h3>';
        html += '<div class="company">' + sanitizeText(edu.institution || '') + '</div>';
        html += '<div class="dates">' + sanitizeText(edu.startDate || '') + ' - ' + sanitizeText(edu.endDate || '') + '</div>';
        if (edu.field) {
          html += '<div class="description">İxtisas: ' + sanitizeText(edu.field) + '</div>';
        }
        html += '</div>';
      });
      html += '</section>';
    }

    // Skills section - exact structure
    if (skills && skills.length > 0) {
      html += '<section class="section">';
      html += '<h2 class="section-title">Bacarıqlar</h2>';
      html += '<div class="skills-grid">';
      skills.forEach((skill: any) => {
        html += '<div class="skill-item">' + sanitizeText(skill.name || skill) + '</div>';
      });
      html += '</div>';
      html += '</section>';
    }

    // Languages section - exact structure
    if (languages && languages.length > 0) {
      html += '<section class="section">';
      html += '<h2 class="section-title">Dillər</h2>';
      html += '<div class="skills-grid">';
      languages.forEach((lang: any) => {
        html += '<div class="skill-item">' + sanitizeText(lang.name || lang) + (lang.level ? ' - ' + sanitizeText(lang.level) : '') + '</div>';
      });
      html += '</div>';
      html += '</section>';
    }

    html += '</div>'; // Close cv-container
    html += '</body>';
    html += '</html>';

    return html;
  }

  // Fallback method - köhnə HTML generation metodu
  private static async generatePDFFallback(cvData: any, templateId?: string): Promise<Buffer> {
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

    let browser;
    try {
      if (isVercel) {
        browser = await puppeteerCore.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome',
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
      console.error('PDF fallback generation error:', error);
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
    
    // Check if it's Traditional CV template
    const isTraditionalTemplate = templateId === 'traditional' || templateId === 'Ənənəvi CV';

    if (isBoldTemplate) {
      return this.generateBoldTemplate(cvData);
    }
    
    if (isTraditionalTemplate) {
      return this.generateTraditionalTemplate(cvData);
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
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .profile-image {
            flex-shrink: 0;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #ddd;
        }
        
        .header-content {
            flex: 1;
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
            ${personalInfo.profileImage ? `
                <img src="${personalInfo.profileImage}" alt="Profile" class="profile-image" />
            ` : ''}
            <div class="header-content">
                <div class="name">${personalInfo.fullName || ''}</div>
                ${personalInfo.title ? `<div class="title">${personalInfo.title}</div>` : ''}
            </div>
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

  private static generateTraditionalTemplate(cvData: any): string {
    const { personalInfo, experience, education, skills, languages, projects, certifications, volunteerExperience, publications } = cvData;

    return `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${personalInfo.fullName || 'CV'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .sidebar-heading-line {
            border-bottom: 2px solid #4a5568;
            width: 50px;
            margin-top: 8px;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-4 md:p-8">
        <div class="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row min-h-[1000px]">
            
            <!-- Sol Panel (Sidebar) -->
            <aside class="w-full md:w-1/3 bg-[#0d2438] text-white p-8">
                <div class="flex flex-col items-center md:items-start">
                    <!-- Profil Şəkli -->
                    ${personalInfo.profileImage ? `
                        <img src="${personalInfo.profileImage}" alt="Profil Şəkli" class="rounded-full w-36 h-36 border-4 border-gray-400 object-cover">
                    ` : `
                        <img src="https://placehold.co/150x150/e2e8f0/334155?text=Şəkil" alt="Profil Şəkli" class="rounded-full w-36 h-36 border-4 border-gray-400 object-cover">
                    `}
                    
                    <!-- Əlaqə Məlumatları -->
                    <div class="mt-8 w-full">
                        <h2 class="text-xl font-bold tracking-wider uppercase">Əlaqə</h2>
                        <div class="sidebar-heading-line"></div>
                        <ul class="mt-4 space-y-3 text-sm">
                            ${personalInfo.phone ? `
                                <li class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>${personalInfo.phone}</span>
                                </li>
                            ` : ''}
                            ${personalInfo.email ? `
                                <li class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span>${personalInfo.email}</span>
                                </li>
                            ` : ''}
                            ${personalInfo.location ? `
                                <li class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>${personalInfo.location}</span>
                                </li>
                            ` : ''}
                            ${personalInfo.website ? `
                                <li class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>
                                    <span>${personalInfo.website}</span>
                                </li>
                            ` : ''}
                            ${personalInfo.linkedin ? `
                                <li class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" /></svg>
                                    <span>${personalInfo.linkedin}</span>
                                </li>
                            ` : ''}
                        </ul>
                    </div>

                    <!-- Təhsil -->
                    ${education && education.length > 0 ? `
                        <div class="mt-8 w-full">
                            <h2 class="text-xl font-bold tracking-wider uppercase">Təhsil</h2>
                            <div class="sidebar-heading-line"></div>
                            ${education.map((edu: any) => `
                                <div class="mt-4">
                                    <h3 class="font-semibold">${edu.degree || ''}</h3>
                                    <p class="text-sm text-gray-300">${edu.institution || ''} | ${edu.startDate || ''} - ${edu.endDate ? edu.endDate : (edu.current ? 'İndi' : '')}</p>
                                    ${edu.gpa ? `<p class="text-sm text-gray-300">GPA: ${edu.gpa}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Bacarıqlar -->
                    ${skills && skills.length > 0 ? `
                        <div class="mt-8 w-full">
                            <h2 class="text-xl font-bold tracking-wider uppercase">Bacarıqlar</h2>
                            <div class="sidebar-heading-line"></div>
                            <ul class="mt-4 space-y-2 text-sm list-disc list-inside">
                                ${skills.map((skill: any) => `
                                    <li>${skill.name || skill.skill || ''}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <!-- Dillər -->
                    ${languages && languages.length > 0 ? `
                        <div class="mt-8 w-full">
                            <h2 class="text-xl font-bold tracking-wider uppercase">Dillər</h2>
                            <div class="sidebar-heading-line"></div>
                            <ul class="mt-4 space-y-2 text-sm list-disc list-inside">
                                ${languages.map((lang: any) => `
                                    <li>${lang.language || lang.name || ''} (${lang.level || ''})</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <!-- Sertifikatlar -->
                    ${certifications && certifications.length > 0 ? `
                        <div class="mt-8 w-full">
                            <h2 class="text-xl font-bold tracking-wider uppercase">Sertifikatlar</h2>
                            <div class="sidebar-heading-line"></div>
                            ${certifications.map((cert: any) => `
                                <div class="mt-4">
                                    <h3 class="font-semibold">${cert.name || ''}</h3>
                                    <p class="text-sm text-gray-300">${cert.issuer || ''} | ${cert.date || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </aside>

            <!-- Sağ Panel (Əsas Məzmun) -->
            <main class="w-full md:w-2/3 p-8 md:p-12">
                <!-- Başlıq (Ad və Vəzifə) -->
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold text-gray-800">${(personalInfo.fullName || '').toUpperCase()}</h1>
                    <p class="text-lg md:text-xl font-medium text-gray-500 tracking-wider mt-2">${(personalInfo.title || '').toUpperCase()}</p>
                </div>

                <!-- Profil -->
                ${personalInfo.summary ? `
                    <section class="mt-10">
                        <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">Profil</h2>
                        <p class="mt-4 text-gray-600 text-sm leading-relaxed">
                            ${personalInfo.summary}
                        </p>
                    </section>
                ` : ''}

                <!-- İş Təcrübəsi -->
                ${experience && experience.length > 0 ? `
                    <section class="mt-10">
                        <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">İş Təcrübəsi</h2>
                        ${experience.map((exp: any) => `
                            <div class="mt-6">
                                <div class="flex justify-between items-baseline">
                                   <h3 class="text-lg font-semibold text-gray-700">${exp.position || ''}</h3>
                                   <p class="text-sm text-gray-500">${exp.startDate || ''} - ${exp.endDate ? exp.endDate : (exp.current ? 'İNDİ' : '')}</p>
                                </div>
                                <p class="text-md text-gray-600">${exp.company || ''}</p>
                                ${exp.location ? `<p class="text-sm text-gray-500">${exp.location}</p>` : ''}
                                ${exp.description ? `
                                    <div class="mt-2 text-sm text-gray-600 space-y-1">
                                        ${exp.description.split('\n').map((line: string) => {
                                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                                                return `<p>• ${line.replace(/^[•-]\s*/, '')}</p>`;
                                            } else if (line.trim()) {
                                                return `<p>${line}</p>`;
                                            }
                                            return '';
                                        }).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Layihələr -->
                ${projects && projects.length > 0 ? `
                    <section class="mt-10">
                        <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">Layihələr</h2>
                        ${projects.map((project: any) => `
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-700">${project.name || ''}</h3>
                                ${project.description ? `<p class="mt-2 text-sm text-gray-600">${project.description}</p>` : ''}
                                ${project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 ? `
                                    <p class="mt-2 text-sm text-gray-500"><strong>Texnologiyalar:</strong> ${project.technologies.join(', ')}</p>
                                ` : ''}
                                ${project.url ? `<p class="mt-1 text-sm text-blue-600">${project.url}</p>` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Könüllü Təcrübə -->
                ${volunteerExperience && volunteerExperience.length > 0 ? `
                    <section class="mt-10">
                        <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">Könüllü Təcrübə</h2>
                        ${volunteerExperience.map((vol: any) => `
                            <div class="mt-6">
                                <div class="flex justify-between items-baseline">
                                   <h3 class="text-lg font-semibold text-gray-700">${vol.role || ''}</h3>
                                   <p class="text-sm text-gray-500">${vol.startDate || ''} - ${vol.current ? 'İNDİ' : vol.endDate || ''}</p>
                                </div>
                                <p class="text-md text-gray-600">${vol.organization || ''}</p>
                                ${vol.cause ? `<p class="text-sm text-gray-500">${vol.cause}</p>` : ''}
                                ${vol.description ? `<p class="mt-2 text-sm text-gray-600">${vol.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}

                <!-- Nəşrlər -->
                ${publications && publications.length > 0 ? `
                    <section class="mt-10">
                        <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2">Nəşrlər</h2>
                        ${publications.map((pub: any) => `
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-700">${pub.title || ''}</h3>
                                ${pub.publisher ? `<p class="text-md text-gray-600">${pub.publisher} | ${pub.date || ''}</p>` : ''}
                                ${pub.authors && pub.authors.length > 0 ? `<p class="text-sm text-gray-500">Müəlliflər: ${pub.authors.join(', ')}</p>` : ''}
                                ${pub.description ? `<p class="mt-2 text-sm text-gray-600">${pub.description}</p>` : ''}
                                ${pub.url ? `<p class="mt-1 text-sm text-blue-600">${pub.url}</p>` : ''}
                            </div>
                        `).join('')}
                    </section>
                ` : ''}
            </main>
        </div>
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
