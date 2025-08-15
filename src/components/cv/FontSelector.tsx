import React, { useState, useEffect } from 'react';
import { FontManager, FontOption, FontSettings, DEFAULT_FONT_SETTINGS } from '../../lib/fontManager';

interface FontSelectorProps {
  currentSettings: FontSettings;
  onSettingsChange: (settings: FontSettings) => void;
  isPremium?: boolean;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  currentSettings,
  onSettingsChange,
  isPremium = false
}) => {
  const [fontManager] = useState(() => FontManager.getInstance());
  const [activeTab, setActiveTab] = useState<'advanced' | 'presets'>('advanced');

  // Load fonts when component mounts and when settings change
  useEffect(() => {
    const applyFonts = async () => {
      try {
        await fontManager.applyFontSettings(currentSettings);
      } catch (error) {
        console.warn('Font loading error:', error);
        // Continue with fallback fonts
      }
    };
    applyFonts();
  }, [currentSettings, fontManager]);

  const handleFontChange = (type: 'headingFont' | 'bodyFont', fontId: string) => {
    const newSettings = { ...currentSettings, [type]: fontId };
    onSettingsChange(newSettings);
  };

  const handleAdvancedChange = (key: keyof FontSettings, value: number) => {
    const newSettings = { ...currentSettings, [key]: value };
    onSettingsChange(newSettings);
  };

  const applyPreset = (preset: any) => {
    const newSettings: FontSettings = {
      ...currentSettings,
      headingFont: preset.heading,
      bodyFont: preset.body
    };
    onSettingsChange(newSettings);
  };

  const FontOptionCard: React.FC<{ font: FontOption; isSelected: boolean; onSelect: () => void }> = ({
    font,
    isSelected,
    onSelect
  }) => (
    <div
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${font.isPremium && !isPremium ? 'opacity-60' : ''}`}
      onClick={font.isPremium && !isPremium ? undefined : onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{font.displayName}</h4>
        {font.isPremium && (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Premium
          </span>
        )}
      </div>
      <div
        className="text-lg mb-2"
        style={{ fontFamily: font.fontFamily }}
      >
        {font.preview}
      </div>
      <p className="text-sm text-gray-600">{font.description}</p>
      {font.isPremium && !isPremium && (
        <div className="mt-2 text-xs text-red-600">
          Premium üzvlük tələb olunur
        </div>
      )}
    </div>
  );

  const FontCategorySection: React.FC<{
    title: string;
    category: 'serif' | 'sans-serif' | 'monospace' | 'display';
    selectedFont: string;
    onFontSelect: (fontId: string) => void;
  }> = ({ title, category, selectedFont, onFontSelect }) => {
    const fonts = fontManager.getFontsByCategory(category);

    return (
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">{title}</h4>
        <div className="space-y-2">
          {fonts.map((font) => (
            <div
              key={font.id}
              className={`p-2 border rounded-lg cursor-pointer transition-all text-xs ${
                selectedFont === font.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${font.isPremium && !isPremium ? 'opacity-60' : ''}`}
              onClick={font.isPremium && !isPremium ? undefined : () => onFontSelect(font.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-xs">{font.displayName}</span>
                {font.isPremium && (
                  <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Premium
                  </span>
                )}
              </div>
              <div
                className="text-sm mb-1"
                style={{ fontFamily: font.fontFamily }}
              >
                {font.preview.substring(0, 30)}...
              </div>
              <p className="text-xs text-gray-500">{font.description.substring(0, 40)}...</p>
              {font.suitableFor && font.suitableFor.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {font.suitableFor.slice(0, 3).map(field => (
                    <span key={field} className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      {field}
                    </span>
                  ))}
                </div>
              )}
              {font.isPremium && !isPremium && (
                <div className="mt-1 text-xs text-red-600">
                  Premium tələb olunur
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Tab Navigation - Optimized for sidebar */}
      <div className="flex flex-col border-b border-gray-200 mb-4">
        <div className="grid grid-cols-2 gap-1">
          {[
            { id: 'advanced', label: 'Tənzimlər', icon: '⚙️' },
            { id: 'presets', label: 'Hazır', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 py-2 font-medium text-xs border-b-2 transition-colors text-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{tab.icon}</span>
                <span className="mt-1">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Preview - Compact for sidebar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Önizləmə</h3>
        <div className="bg-white p-3 rounded border text-xs space-y-1">
          <div className="cv-heading">Başlıq Şrifti</div>
          <div className="cv-subheading">Alt başlıq</div>
          <div className="cv-body">Əsas mətn şrifti nümunəsi</div>
          <div className="cv-small">Kiçik mətn</div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          {/* Individual Font Size Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Şrift Ölçüləri</h4>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Başlıq Ölçüsü: {currentSettings.fontSizes?.heading || 14}pt
              </label>
              <input
                type="range"
                min="10"
                max="22"
                step="0.5"
                value={currentSettings.fontSizes?.heading || 14}
                onChange={(e) => {
                  const newSettings = {
                    ...currentSettings,
                    fontSizes: {
                      heading: 14,
                      subheading: 12,
                      body: 11,
                      small: 9,
                      ...currentSettings.fontSizes,
                      heading: parseFloat(e.target.value)
                    }
                  };
                  onSettingsChange(newSettings);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Alt Başlıq Ölçüsü: {currentSettings.fontSizes?.subheading || 12}pt
              </label>
              <input
                type="range"
                min="9"
                max="18"
                step="0.5"
                value={currentSettings.fontSizes?.subheading || 12}
                onChange={(e) => {
                  const newSettings = {
                    ...currentSettings,
                    fontSizes: {
                      heading: 14,
                      subheading: 12,
                      body: 11,
                      small: 9,
                      ...currentSettings.fontSizes,
                      subheading: parseFloat(e.target.value)
                    }
                  };
                  onSettingsChange(newSettings);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Əsas Mətn Ölçüsü: {currentSettings.fontSizes?.body || 11}pt
              </label>
              <input
                type="range"
                min="8"
                max="16"
                step="0.5"
                value={currentSettings.fontSizes?.body || 11}
                onChange={(e) => {
                  const newSettings = {
                    ...currentSettings,
                    fontSizes: {
                      heading: 14,
                      subheading: 12,
                      body: 11,
                      small: 9,
                      ...currentSettings.fontSizes,
                      body: parseFloat(e.target.value)
                    }
                  };
                  onSettingsChange(newSettings);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Kiçik Mətn Ölçüsü: {currentSettings.fontSizes?.small || 9}pt
              </label>
              <input
                type="range"
                min="7"
                max="12"
                step="0.5"
                value={currentSettings.fontSizes?.small || 9}
                onChange={(e) => {
                  const newSettings = {
                    ...currentSettings,
                    fontSizes: {
                      heading: 14,
                      subheading: 12,
                      body: 11,
                      small: 9,
                      ...currentSettings.fontSizes,
                      small: parseFloat(e.target.value)
                    }
                  };
                  onSettingsChange(newSettings);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* General Font Settings */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Ümumi Tənzimlər</h4>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Sətir Hündürlüyü: {currentSettings.lineHeight}
              </label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={currentSettings.lineHeight}
                onChange={(e) => handleAdvancedChange('lineHeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Hərf Aralığı: {currentSettings.letterSpacing}px
              </label>
              <input
                type="range"
                min="-2"
                max="5"
                step="0.1"
                value={currentSettings.letterSpacing}
                onChange={(e) => handleAdvancedChange('letterSpacing', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Font Weight Controls */}
          {currentSettings.fontWeight && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Şrift Qalınlığı</h4>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Başlıq Qalınlığı: {currentSettings.fontWeight.heading}
                </label>
                <input
                  type="range"
                  min="400"
                  max="900"
                  step="100"
                  value={currentSettings.fontWeight.heading}
                  onChange={(e) => {
                    const newSettings = {
                      ...currentSettings,
                      fontWeight: {
                        ...currentSettings.fontWeight!,
                        heading: parseInt(e.target.value)
                      }
                    };
                    onSettingsChange(newSettings);
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Mətn Qalınlığı: {currentSettings.fontWeight.body}
                </label>
                <input
                  type="range"
                  min="300"
                  max="700"
                  step="100"
                  value={currentSettings.fontWeight.body}
                  onChange={(e) => {
                    const newSettings = {
                      ...currentSettings,
                      fontWeight: {
                        ...currentSettings.fontWeight!,
                        body: parseInt(e.target.value)
                      }
                    };
                    onSettingsChange(newSettings);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Font Performance Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-xs font-medium text-blue-900 mb-2">Şrift Statusu</h4>
            <div className="text-xs text-blue-700">
              {(() => {
                const status = fontManager.getFontLoadingStatus();
                return `Yükləndi: ${status.loaded.length}/${status.total}`;
              })()}
            </div>
          </div>

          <button
            onClick={() => onSettingsChange(DEFAULT_FONT_SETTINGS)}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sıfırla
          </button>
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="space-y-3">
          {fontManager.getRecommendedCombinations().map((preset, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => applyPreset(preset)}
            >
              <h4 className="font-medium text-gray-900 text-sm mb-1">{preset.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{preset.description}</p>
              <div className="space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Başlıq:</span> {fontManager.getFontOption(preset.heading)?.displayName}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Mətn:</span> {fontManager.getFontOption(preset.body)?.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSelector;
