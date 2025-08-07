import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface CVExportData {
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
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
    level?: string;
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
    github?: string;
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
}

// PDF Export using browser's print functionality
export const exportToPDF = async (elementId: string, filename: string = 'CV') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('CV element not found for PDF export');
    alert('CV elementi tapılmadı. Səhifəni yeniləyin və yenidən cəhd edin.');
    return;
  }

  try {
    // Create a clone of the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Remove any export buttons from the clone
    const buttons = clonedElement.querySelectorAll('button, [class*="export"]');
    buttons.forEach(btn => btn.remove());

    // Create a temporary container with exact styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '794px'; // A4 width
    tempContainer.style.background = 'white';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.fontSize = '11pt';
    tempContainer.style.lineHeight = '1.3';
    tempContainer.style.color = '#333';
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Get computed styles for all elements
    const getAllStyles = (element: Element): string => {
      const styles = window.getComputedStyle(element);
      let cssText = '';
      for (let i = 0; i < styles.length; i++) {
        const property = styles[i];
        const value = styles.getPropertyValue(property);
        cssText += `${property}: ${value}; `;
      }
      return cssText;
    };

    // Apply inline styles to preserve exact appearance
    const applyInlineStyles = (element: Element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.cssText = getAllStyles(element);

      for (let child of element.children) {
        applyInlineStyles(child);
      }
    };

    applyInlineStyles(clonedElement);

    // Create print window with exact styling
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Popup bloklandı. Brauzer ayarlarından popup-ları aktiv edin.');
      document.body.removeChild(tempContainer);
      return;
    }

    // Get all stylesheets from the current page
    const styleSheets = Array.from(document.styleSheets);
    let allStyles = '';

    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          allStyles += rule.cssText + '\n';
        });
      } catch (e) {
        // CORS or other restrictions - skip this stylesheet
      }
    });

    // Create the print document with exact styling
    const printHTML = `
      <!DOCTYPE html>
      <html lang="az">
      <head>
        <meta charset="UTF-8">
        <title>${filename}</title>
        <style>
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #333;
            background: white;
          }
          
          /* Import all original styles */
          ${allStyles}
          
          /* Hide any remaining buttons or interactive elements */
          button, 
          [class*="button"], 
          [class*="export"],
          input[type="button"],
          input[type="submit"] {
            display: none !important;
          }
          
          /* Ensure proper spacing and layout */
          .space-y-1 > * + * { margin-top: 0.25rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          
          .text-sm { font-size: 0.875rem; }
          .text-lg { font-size: 1.125rem; }
          .text-2xl { font-size: 1.5rem; }
          
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          
          .text-gray-900 { color: #111827; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          
          .border-l-2 { border-left-width: 2px; }
          .border-blue-200 { border-color: #dbeafe; }
          .border-green-200 { border-color: #dcfce7; }
          .border-purple-200 { border-color: #e9d5ff; }
          .border-yellow-200 { border-color: #fef3c7; }
          .border-red-200 { border-color: #fecaca; }
          .border-orange-200 { border-color: #fed7aa; }
          .border-teal-200 { border-color: #99f6e4; }
          .border-indigo-200 { border-color: #c7d2fe; }
          .border-pink-200 { border-color: #fbcfe8; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-300 { border-color: #d1d5db; }
          
          .pl-4 { padding-left: 1rem; }
          .pb-1 { padding-bottom: 0.25rem; }
          
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          
          .flex { display: flex; }
          .grid { display: grid; }
          .items-center { align-items: center; }
          .justify-between { justify-content: space-between; }
          .flex-wrap { flex-wrap: wrap; }
          
          .bg-gray-100 { background-color: #f3f4f6; }
          .bg-green-600 { background-color: #059669; }
          
          .rounded { border-radius: 0.25rem; }
          .rounded-full { border-radius: 9999px; }
          
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          
          .text-xs { font-size: 0.75rem; }
          
          .h-1\\.5 { height: 0.375rem; }
          .w-full { width: 100%; }
          
          .transition-all { transition: all 0.3s; }
          
          /* Responsive adjustments for print */
          @media print {
            body { print-color-adjust: exact; }
            * { print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${clonedElement.outerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Clean up temporary element
    document.body.removeChild(tempContainer);

    // Wait for content to load and then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 1000);

  } catch (error) {
    console.error('PDF export error:', error);
    alert('PDF yükləməsində xəta baş verdi. Zəhmət olmasa təkrar cəhd edin.');
  }
};

// DOCX Export function
export const exportToDOCX = async (cvData: CVExportData, filename: string = 'CV') => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Personal Info Header
        new Paragraph({
          children: [
            new TextRun({
              text: cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'CV',
              bold: true,
              size: 32,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // Contact Information
        ...(cvData.personalInfo?.email || cvData.personalInfo?.phone ? [
          new Paragraph({
            children: [
              new TextRun({
                text: [
                  cvData.personalInfo?.email,
                  cvData.personalInfo?.phone,
                  cvData.personalInfo?.website,
                  cvData.personalInfo?.linkedin
                ].filter(Boolean).join(' | '),
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
        ] : []),

        // Professional Summary
        ...(cvData.personalInfo?.summary ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cvData.personalInfo.summary,
                size: 20,
              }),
            ],
            spacing: { after: 300 },
          }),
        ] : []),

        // Work Experience
        ...(cvData.experience && cvData.experience.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'WORK EXPERIENCE',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.position || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company || '',
                  italics: true,
                  size: 20,
                }),
                new TextRun({
                  text: ` | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
                  size: 18,
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
                spacing: { after: 200 },
              }),
            ] : []),
          ]),
        ] : []),

        // Education
        ...(cvData.education && cvData.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.education.flatMap(edu => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree} - ${edu.field}`,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.institution || '',
                  italics: true,
                  size: 20,
                }),
                new TextRun({
                  text: ` | ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}`,
                  size: 18,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),

        // Skills
        ...(cvData.skills && cvData.skills.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cvData.skills.map(skill => skill.name).join(' • '),
                size: 20,
              }),
            ],
            spacing: { after: 300 },
          }),
        ] : []),

        // Languages
        ...(cvData.languages && cvData.languages.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'LANGUAGES',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.languages.map(lang =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `${lang.name} - ${lang.level}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            })
          ),
        ] : []),

        // Projects
        ...(cvData.projects && cvData.projects.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROJECTS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.projects.flatMap(project => [
            new Paragraph({
              children: [
                new TextRun({
                  text: project.name || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            ...(project.description ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: project.description,
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            ] : []),
            ...(project.technologies && project.technologies.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Technologies: ${project.technologies.join(', ')}`,
                    size: 18,
                    italics: true,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ] : []),
          ]),
        ] : []),

        // Certifications
        ...(cvData.certifications && cvData.certifications.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'CERTIFICATIONS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.certifications.flatMap(cert => [
            new Paragraph({
              children: [
                new TextRun({
                  text: cert.name || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${cert.issuer} | ${cert.issueDate || cert.date}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),

        // Volunteer Experience
        ...(cvData.volunteerExperience && cvData.volunteerExperience.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'VOLUNTEER EXPERIENCE',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.volunteerExperience.flatMap(vol => [
            new Paragraph({
              children: [
                new TextRun({
                  text: vol.role || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${vol.organization} | ${vol.startDate} - ${vol.current ? 'Present' : vol.endDate}`,
                  size: 20,
                }),
              ],
              spacing: { after: 50 },
            }),
            ...(vol.description ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: vol.description,
                    size: 20,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ] : []),
          ]),
        ] : []),

        // Publications
        ...(cvData.publications && cvData.publications.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'PUBLICATIONS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.publications.flatMap(pub => [
            new Paragraph({
              children: [
                new TextRun({
                  text: pub.title || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            ...(pub.publisher ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${pub.publisher} | ${pub.date}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 50 },
              }),
            ] : []),
            ...(pub.description ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: pub.description,
                    size: 20,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ] : []),
          ]),
        ] : []),

        // Honors & Awards
        ...(cvData.honorsAwards && cvData.honorsAwards.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'HONORS & AWARDS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.honorsAwards.flatMap(award => [
            new Paragraph({
              children: [
                new TextRun({
                  text: award.title || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${award.issuer} | ${award.date}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),

        // Test Scores
        ...(cvData.testScores && cvData.testScores.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'TEST SCORES',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.testScores.flatMap(score => [
            new Paragraph({
              children: [
                new TextRun({
                  text: score.testName || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Score: ${score.score} | ${score.date}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),

        // Recommendations
        ...(cvData.recommendations && cvData.recommendations.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'RECOMMENDATIONS',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.recommendations.flatMap(rec => [
            new Paragraph({
              children: [
                new TextRun({
                  text: rec.recommenderName || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${rec.recommenderTitle} at ${rec.recommenderCompany}`,
                  size: 20,
                }),
              ],
              spacing: { after: 50 },
            }),
            ...(rec.text ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `"${rec.text}"`,
                    size: 20,
                    italics: true,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ] : []),
          ]),
        ] : []),

        // Courses
        ...(cvData.courses && cvData.courses.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: 'COURSES',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...cvData.courses.flatMap(course => [
            new Paragraph({
              children: [
                new TextRun({
                  text: course.name || '',
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { before: 100, after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${course.institution} | ${course.completionDate}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
          ]),
        ] : []),
      ],
    }],
  });

  // Generate and download DOCX
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
