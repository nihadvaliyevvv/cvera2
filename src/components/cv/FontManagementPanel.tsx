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

      {/* Font Management Sidebar Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Left Sidebar Panel */}
          <div className={`fixed left-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Header - Fixed at top */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Şrift İdarəsi</h2>
                <p className="text-sm text-gray-600">CV şriftlərini tənzimləyin</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                <div className="flex">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-2">
                    <h3 className="text-sm font-medium text-red-800">Xəta</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Font Selector Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4">
                <FontSelector
                  currentSettings={fontSettings}
                  onSettingsChange={handleSettingsChange}
                  isPremium={isPremium}
                />
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Dəyişikliklər avtomatik saxlanır
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Bağla
                  </button>
                  {onClose && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onClose?.();
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Tətbiq Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FontManagementPanel;
