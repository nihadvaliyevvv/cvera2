'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { trackLinkedInImport, trackCVCreation } from '@/components/GoogleAnalytics';

interface LinkedInAutoImportProps {
  onImportSuccess?: (profileData: any) => void;
  onImportError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function LinkedInAutoImport({
  onImportSuccess,
  onImportError,
  className = '',
  children
}: LinkedInAutoImportProps) {
  const { user, canAutoImportLinkedIn, importLinkedInProfile, loading } = useAuth();
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleImport = async () => {
    if (!canAutoImportLinkedIn()) {
      const errorMessage = 'LinkedIn auto-import yalnız LinkedIn ilə giriş edən istifadəçilər üçündür';
      setImportStatus('error');
      onImportError?.(errorMessage);

      // Track failed import attempt
      trackLinkedInImport(false);
      return;
    }

    setImporting(true);
    setImportStatus('idle');

    try {
      console.log('🔄 LinkedIn profil import başlayır...');
      const result = await importLinkedInProfile();

      console.log('✅ LinkedIn profil uğurla import edildi:', result);
      setImportStatus('success');
      onImportSuccess?.(result);

      // Track successful LinkedIn import
      trackLinkedInImport(true);
      trackCVCreation('linkedin');

      // Show success message for 3 seconds
      setTimeout(() => {
        setImportStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('❌ LinkedIn import xətası:', error);
      const errorMessage = error instanceof Error ? error.message : 'LinkedIn import zamanı xəta baş verdi';
      setImportStatus('error');
      onImportError?.(errorMessage);

      // Track failed import
      trackLinkedInImport(false);

      // Show error message for 5 seconds
      setTimeout(() => {
        setImportStatus('idle');
      }, 5000);
    } finally {
      setImporting(false);
    }
  };

  // Don't show the button if user can't auto-import
  if (!canAutoImportLinkedIn()) {
    return null;
  }

  const isDisabled = importing || loading;
  const buttonText = importing
    ? 'LinkedIn məlumatları yüklənir...'
    : importStatus === 'success'
      ? '✅ Uğurla import edildi!'
      : importStatus === 'error'
        ? '❌ Xəta baş verdi'
        : 'LinkedIn profilimi import et';

  return (
    <div className={`linkedin-auto-import ${className}`}>
      {children ? (
        <div onClick={handleImport} className={isDisabled ? 'disabled' : 'cursor-pointer'}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleImport}
          disabled={isDisabled}
          className={`
            inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200
            transform hover:scale-105 active:scale-95
            ${importing 
              ? 'bg-blue-400 text-white cursor-not-allowed' 
              : importStatus === 'success'
                ? 'bg-green-500 text-white cursor-default'
                : importStatus === 'error'
                  ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }
            disabled:transform-none disabled:hover:scale-100
            ${className}
          `}
        >
          {importing && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}

          {!importing && importStatus === 'idle' && (
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          )}

          <span className="font-semibold">{buttonText}</span>
        </button>
      )}

      {importStatus === 'error' && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          LinkedIn məlumatları import edilə bilmədi. Zəhmət olmasa bir daha cəhd edin.
        </div>
      )}

      {importStatus === 'success' && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
          LinkedIn profil məlumatlarınız uğurla import edildi! 🎉
        </div>
      )}
    </div>
  );
}

// Hook for using LinkedIn auto-import in other components
export function useLinkedInAutoImport() {
  const { canAutoImportLinkedIn, importLinkedInProfile } = useAuth();
  const [importing, setImporting] = useState(false);

  const performImport = async () => {
    if (!canAutoImportLinkedIn()) {
      throw new Error('LinkedIn auto-import mövcud deyil');
    }

    setImporting(true);
    try {
      const result = await importLinkedInProfile();
      return result;
    } finally {
      setImporting(false);
    }
  };

  return {
    canAutoImport: canAutoImportLinkedIn(),
    performImport,
    importing
  };
}
