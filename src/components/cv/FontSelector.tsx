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
  const [activeTab, setActiveTab] = useState<'fonts' | 'advanced' | 'presets'>('fonts');

  // Load fonts when component mounts
  useEffect(() => {
    fontManager.applyFontSettings(currentSettings);
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
    category: 'serif' | 'sans-serif' | 'monospace';
    selectedFont: string;
    onFontSelect: (fontId: string) => void;
  }> = ({ title, category, selectedFont, onFontSelect }) => {
    const fonts = fontManager.getFontsByCategory(category);

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fonts.map((font) => (
            <FontOptionCard
              key={font.id}
              font={font}
              isSelected={selectedFont === font.id}
              onSelect={() => onFontSelect(font.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Şrift İdarəsi</h2>
        <p className="text-gray-600">CV-nizin şriftlərini seçin və tənzimləyin</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'fonts', label: 'Şriftlər', icon: '🔤' },
          { id: 'advanced', label: 'Ətraflı Tənzimlər', icon: '⚙️' },
          { id: 'presets', label: 'Hazır Kombinasiyalar', icon: '🎨' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Font Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Önizləmə</h3>
        <div className="bg-white p-4 rounded border">
          <div className="cv-heading mb-2">Başlıq Şrifti Nümunəsi</div>
          <div className="cv-subheading mb-2">Alt başlıq şrifti nümunəsi</div>
          <div className="cv-body mb-2">Əsas mətn şrifti nümunəsi - bu CV-də əsas məlumatların görünəcəyi şriftdir.</div>
          <div className="cv-small">Kiçik mətn şrifti nümunəsi</div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'fonts' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Başlıq Şrifti</h3>
              <FontCategorySection
                title="Serif Şriftləri"
                category="serif"
                selectedFont={currentSettings.headingFont}
                onFontSelect={(fontId) => handleFontChange('headingFont', fontId)}
              />
              <FontCategorySection
                title="Sans-serif Şriftləri"
                category="sans-serif"
                selectedFont={currentSettings.headingFont}
                onFontSelect={(fontId) => handleFontChange('headingFont', fontId)}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Əsas Mətn Şrifti</h3>
              <FontCategorySection
                title="Serif Şriftləri"
                category="serif"
                selectedFont={currentSettings.bodyFont}
                onFontSelect={(fontId) => handleFontChange('bodyFont', fontId)}
              />
              <FontCategorySection
                title="Sans-serif Şriftləri"
                category="sans-serif"
                selectedFont={currentSettings.bodyFont}
                onFontSelect={(fontId) => handleFontChange('bodyFont', fontId)}
              />
              <FontCategorySection
                title="Monospace Şriftləri"
                category="monospace"
                selectedFont={currentSettings.bodyFont}
                onFontSelect={(fontId) => handleFontChange('bodyFont', fontId)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şrift Ölçüsü
              </label>
              <input
                type="range"
                min="9"
                max="16"
                step="0.5"
                value={currentSettings.fontSize}
                onChange={(e) => handleAdvancedChange('fontSize', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{currentSettings.fontSize}pt</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sətir Hündürlüyü
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
              <div className="text-sm text-gray-600 mt-1">{currentSettings.lineHeight}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hərf Aralığı
              </label>
              <input
                type="range"
                min="-1"
                max="3"
                step="0.1"
                value={currentSettings.letterSpacing}
                onChange={(e) => handleAdvancedChange('letterSpacing', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{currentSettings.letterSpacing}px</div>
            </div>

            <div>
              <button
                onClick={() => onSettingsChange(DEFAULT_FONT_SETTINGS)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fontManager.getRecommendedCombinations().map((preset, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
              onClick={() => applyPreset(preset)}
            >
              <h4 className="font-semibold text-gray-900 mb-2">{preset.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Başlıq:</span> {fontManager.getFontOption(preset.heading)?.displayName}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Mətn:</span> {fontManager.getFontOption(preset.body)?.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {!isPremium && (
            <span>Premium üzvlük ilə bütün şriftlərə çıxış əldə edin</span>
          )}
        </div>
        <div className="space-x-3">
          <button
            onClick={() => onSettingsChange(DEFAULT_FONT_SETTINGS)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sıfırla
          </button>
          <button
            onClick={() => {
              // Save settings to localStorage or API
              localStorage.setItem('cvFontSettings', JSON.stringify(currentSettings));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yadda Saxla
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
