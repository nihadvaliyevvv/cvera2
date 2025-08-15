import { useState, useEffect, useCallback } from 'react';
import { FontSettings, DEFAULT_FONT_SETTINGS, FontManager } from '../lib/fontManager';

interface UseFontSettingsReturn {
  fontSettings: FontSettings;
  updateFontSettings: (settings: FontSettings) => void;
  resetFontSettings: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useFontSettings = (cvId?: string): UseFontSettingsReturn => {
  const [fontSettings, setFontSettings] = useState<FontSettings>(DEFAULT_FONT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fontManager = FontManager.getInstance();

  // Load font settings from localStorage or API
  const loadFontSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to load from localStorage
      const localSettings = localStorage.getItem('cvFontSettings');
      if (localSettings) {
        const parsedSettings = JSON.parse(localSettings);
        setFontSettings({ ...DEFAULT_FONT_SETTINGS, ...parsedSettings });
      }

      // If CV ID is provided, try to load specific settings for this CV
      if (cvId) {
        const cvSpecificKey = `cvFontSettings_${cvId}`;
        const cvSpecificSettings = localStorage.getItem(cvSpecificKey);
        if (cvSpecificSettings) {
          const parsedSettings = JSON.parse(cvSpecificSettings);
          setFontSettings({ ...DEFAULT_FONT_SETTINGS, ...parsedSettings });
        }
      }
    } catch (err) {
      console.error('Error loading font settings:', err);
      setError('Şrift tənzimləri yüklənərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [cvId]);

  // Save font settings to localStorage and apply to DOM
  const updateFontSettings = useCallback(async (newSettings: FontSettings) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate settings
      const validatedSettings = {
        ...DEFAULT_FONT_SETTINGS,
        ...newSettings,
        fontSize: Math.max(9, Math.min(16, newSettings.fontSize)),
        lineHeight: Math.max(1.0, Math.min(2.0, newSettings.lineHeight)),
        letterSpacing: Math.max(-1, Math.min(3, newSettings.letterSpacing))
      };

      setFontSettings(validatedSettings);

      // Apply font settings to DOM
      await fontManager.applyFontSettings(validatedSettings);

      // Save to localStorage
      localStorage.setItem('cvFontSettings', JSON.stringify(validatedSettings));

      // If CV ID is provided, save CV-specific settings
      if (cvId) {
        const cvSpecificKey = `cvFontSettings_${cvId}`;
        localStorage.setItem(cvSpecificKey, JSON.stringify(validatedSettings));
      }

    } catch (err) {
      console.error('Error updating font settings:', err);
      setError('Şrift tənzimləri yadda saxlanarkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  }, [cvId, fontManager]);

  // Reset to default settings
  const resetFontSettings = useCallback(() => {
    updateFontSettings(DEFAULT_FONT_SETTINGS);
  }, [updateFontSettings]);

  // Load settings on mount
  useEffect(() => {
    loadFontSettings();
  }, [loadFontSettings]);

  return {
    fontSettings,
    updateFontSettings,
    resetFontSettings,
    isLoading,
    error
  };
};

export default useFontSettings;
