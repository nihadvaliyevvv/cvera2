// Font Management System for CV Application
export interface FontOption {
  id: string;
  name: string;
  displayName: string;
  category: 'serif' | 'sans-serif' | 'monospace';
  fontFamily: string;
  googleFont?: string;
  weight?: string[];
  preview: string;
  description: string;
  isPremium?: boolean;
}

export interface FontSettings {
  headingFont: string;
  bodyFont: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

// Professional font options for CV
export const FONT_OPTIONS: FontOption[] = [
  // Serif Fonts - Professional for traditional CVs
  {
    id: 'times',
    name: 'Times New Roman',
    displayName: 'Times New Roman',
    category: 'serif',
    fontFamily: '"Times New Roman", Times, serif',
    weight: ['400', '700'],
    preview: 'Professional, traditional və klassik görünüş üçün ideal',
    description: 'Ənənəvi və peşəkar CV-lər üçün ən məşhur seçim'
  },
  {
    id: 'georgia',
    name: 'Georgia',
    displayName: 'Georgia',
    category: 'serif',
    fontFamily: 'Georgia, "Times New Roman", serif',
    weight: ['400', '700'],
    preview: 'Oxunması asan və modern serif şrift',
    description: 'Həm çap, həm də ekranda əla görünən serif şrift'
  },
  {
    id: 'crimson',
    name: 'Crimson Text',
    displayName: 'Crimson Text',
    category: 'serif',
    fontFamily: '"Crimson Text", Georgia, serif',
    googleFont: 'Crimson+Text:400,600,700',
    weight: ['400', '600', '700'],
    preview: 'Zərif və oxunması asan serif dizayn',
    description: 'Akademik və peşəkar sənədlər üçün ideal',
    isPremium: true
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    displayName: 'Playfair Display',
    category: 'serif',
    fontFamily: '"Playfair Display", Georgia, serif',
    googleFont: 'Playfair+Display:400,600,700',
    weight: ['400', '600', '700'],
    preview: 'Yaradıcı və zərif başlıqlar üçün',
    description: 'Dizayn və yaradıcı sahələr üçün mükəmməl',
    isPremium: true
  },

  // Sans-serif Fonts - Modern and clean
  {
    id: 'arial',
    name: 'Arial',
    displayName: 'Arial',
    category: 'sans-serif',
    fontFamily: 'Arial, sans-serif',
    weight: ['400', '700'],
    preview: 'Sadə, təmiz və universal',
    description: 'Bütün platformalarda eyni görünən etibarlı seçim'
  },
  {
    id: 'helvetica',
    name: 'Helvetica',
    displayName: 'Helvetica',
    category: 'sans-serif',
    fontFamily: 'Helvetica, Arial, sans-serif',
    weight: ['400', '700'],
    preview: 'Klassik Swiss dizayn',
    description: 'Professional və minimal görünüş üçün ideal'
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    displayName: 'Open Sans',
    category: 'sans-serif',
    fontFamily: '"Open Sans", Arial, sans-serif',
    googleFont: 'Open+Sans:400,600,700',
    weight: ['400', '600', '700'],
    preview: 'Dost-canlısı və oxunması asan',
    description: 'Modern CV-lər üçün ən populyar seçim'
  },
  {
    id: 'lato',
    name: 'Lato',
    displayName: 'Lato',
    category: 'sans-serif',
    fontFamily: 'Lato, Arial, sans-serif',
    googleFont: 'Lato:400,700',
    weight: ['400', '700'],
    preview: 'Professional və müasir',
    description: 'Korporativ mühit üçün mükəmməl'
  },
  {
    id: 'inter',
    name: 'Inter',
    displayName: 'Inter',
    category: 'sans-serif',
    fontFamily: 'Inter, Arial, sans-serif',
    googleFont: 'Inter:400,500,600,700',
    weight: ['400', '500', '600', '700'],
    preview: 'Müasir və texnoloji görünüş',
    description: 'IT və texnoloji sahələr üçün ideal',
    isPremium: true
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    displayName: 'Montserrat',
    category: 'sans-serif',
    fontFamily: 'Montserrat, Arial, sans-serif',
    googleFont: 'Montserrat:400,500,600,700',
    weight: ['400', '500', '600', '700'],
    preview: 'Güclü və diqqət çəkən',
    description: 'Lidərlik vəzifələri üçün əla seçim',
    isPremium: true
  },

  // Monospace Fonts - For technical CVs
  {
    id: 'courier',
    name: 'Courier New',
    displayName: 'Courier New',
    category: 'monospace',
    fontFamily: '"Courier New", Courier, monospace',
    weight: ['400', '700'],
    preview: 'Texniki və proqramlaşdırma',
    description: 'Proqramçılar və texniki mütəxəssislər üçün'
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    displayName: 'Fira Code',
    category: 'monospace',
    fontFamily: '"Fira Code", "Courier New", monospace',
    googleFont: 'Fira+Code:400,500,600',
    weight: ['400', '500', '600'],
    preview: 'Modern proqramlaşdırma şrifti',
    description: 'Software developers üçün ən yaxşı seçim',
    isPremium: true
  }
];

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  headingFont: 'times',
  bodyFont: 'times',
  fontSize: 11,
  lineHeight: 1.4,
  letterSpacing: 0
};

export class FontManager {
  private static instance: FontManager;
  private loadedFonts: Set<string> = new Set();

  static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  // Load Google Fonts dynamically
  async loadGoogleFont(fontOption: FontOption): Promise<void> {
    if (!fontOption.googleFont || this.loadedFonts.has(fontOption.googleFont)) {
      return;
    }

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontOption.googleFont}&display=swap`;
    link.rel = 'stylesheet';

    document.head.appendChild(link);
    this.loadedFonts.add(fontOption.googleFont);

    // Wait for font to load
    return new Promise((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Continue even if font fails to load
    });
  }

  // Get font option by ID
  getFontOption(fontId: string): FontOption | undefined {
    return FONT_OPTIONS.find(font => font.id === fontId);
  }

  // Get font options by category
  getFontsByCategory(category: 'serif' | 'sans-serif' | 'monospace'): FontOption[] {
    return FONT_OPTIONS.filter(font => font.category === category);
  }

  // Get premium fonts
  getPremiumFonts(): FontOption[] {
    return FONT_OPTIONS.filter(font => font.isPremium);
  }

  // Generate CSS for font settings
  generateFontCSS(settings: FontSettings): string {
    const headingFont = this.getFontOption(settings.headingFont);
    const bodyFont = this.getFontOption(settings.bodyFont);

    return `
      .cv-heading {
        font-family: ${headingFont?.fontFamily || 'Arial, sans-serif'};
        font-size: ${settings.fontSize + 2}pt;
        font-weight: 700;
        line-height: ${settings.lineHeight};
        letter-spacing: ${settings.letterSpacing}px;
      }
      
      .cv-subheading {
        font-family: ${headingFont?.fontFamily || 'Arial, sans-serif'};
        font-size: ${settings.fontSize + 1}pt;
        font-weight: 600;
        line-height: ${settings.lineHeight};
        letter-spacing: ${settings.letterSpacing}px;
      }
      
      .cv-body {
        font-family: ${bodyFont?.fontFamily || 'Arial, sans-serif'};
        font-size: ${settings.fontSize}pt;
        font-weight: 400;
        line-height: ${settings.lineHeight};
        letter-spacing: ${settings.letterSpacing}px;
      }
      
      .cv-small {
        font-family: ${bodyFont?.fontFamily || 'Arial, sans-serif'};
        font-size: ${settings.fontSize - 1}pt;
        font-weight: 400;
        line-height: ${settings.lineHeight};
        letter-spacing: ${settings.letterSpacing}px;
      }
    `;
  }

  // Apply font settings to CV
  async applyFontSettings(settings: FontSettings): Promise<void> {
    const headingFont = this.getFontOption(settings.headingFont);
    const bodyFont = this.getFontOption(settings.bodyFont);

    // Load Google Fonts if needed
    if (headingFont?.googleFont) {
      await this.loadGoogleFont(headingFont);
    }
    if (bodyFont?.googleFont && bodyFont.id !== headingFont?.id) {
      await this.loadGoogleFont(bodyFont);
    }

    // Create or update style element
    let styleElement = document.getElementById('cv-font-styles') as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'cv-font-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = this.generateFontCSS(settings);
  }

  // Check if user has premium access (placeholder for integration)
  checkPremiumAccess(): boolean {
    // This should be integrated with your premium system
    return true; // For now, allow all fonts
  }

  // Get recommended font combinations
  getRecommendedCombinations(): Array<{name: string, heading: string, body: string, description: string}> {
    return [
      {
        name: 'Klassik Professional',
        heading: 'times',
        body: 'times',
        description: 'Ənənəvi və etibarlı görünüş'
      },
      {
        name: 'Modern Minimalist',
        heading: 'inter',
        body: 'open-sans',
        description: 'Müasir və təmiz dizayn'
      },
      {
        name: 'Creative Elegant',
        heading: 'playfair',
        body: 'crimson',
        description: 'Yaradıcı sahələr üçün'
      },
      {
        name: 'Corporate Clean',
        heading: 'montserrat',
        body: 'lato',
        description: 'Korporativ mühit üçün'
      },
      {
        name: 'Technical Focus',
        heading: 'inter',
        body: 'fira-code',
        description: 'IT və texniki mütəxəssislər üçün'
      }
    ];
  }
}

export default FontManager;
