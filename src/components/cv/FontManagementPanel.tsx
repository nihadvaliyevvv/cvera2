import React, { useState } from 'react';
import FontSelector from './FontSelector';
import { useFontSettings } from '../../hooks/useFontSettings';
import type { FontSettings } from '../../lib/fontManager';

interface FontManagementPanelProps {
  cvId?: string;
  isPremium?: boolean;
  onClose?: () => void;
}

const FontManagementPanel: React.FC<FontManagementPanelProps> = ({
  cvId,
  isPremium = false,
  onClose
}) => {
  const { fontSettings, updateFontSettings, isLoading, error } = useFontSettings(cvId);
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingsChange = (settings: FontSettings) => {
    updateFontSettings(settings);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Font Management Button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        disabled={isLoading}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Şrift İdarəsi
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {/* Font Management Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Şrift İdarəsi</h2>
                  <p className="text-gray-600">CV-nizin şriftlərini peşəkar şəkildə idarə edin</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Xəta</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Font Selector Component */}
              <div className="max-h-[70vh] overflow-y-auto">
                <FontSelector
                  currentSettings={fontSettings}
                  onSettingsChange={handleSettingsChange}
                  isPremium={isPremium}
                />
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Şrift dəyişiklikləri avtomatik olaraq yadda saxlanır
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Bağla
                  </button>
                  {onClose && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onClose?.();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Tətbiq Et və Bağla
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FontManagementPanel;
