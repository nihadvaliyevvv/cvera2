'use client';

import { useState } from 'react';

interface LinkedInData {
  sessionId?: string;
  redirectUrl?: string;
  personalInfo?: {
    name: string;
    email: string;
    phone?: string;
    linkedin: string;
    summary?: string;
    website?: string;
    headline?: string;
  };
  experience?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    jobType?: string;
    skills?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
    activities?: string;
    grade?: string;
  }>;
  skills?: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    skills?: string;
    url?: string;
  }>;
}

interface LinkedInImportProps {
  onImport: (data: any) => void;
  onCancel: () => void;
}

export default function LinkedInImport({ onImport, onCancel }: LinkedInImportProps) {
  // Check if you want to re-enable LinkedIn import
  // First get RapidAPI subscription to "Fresh LinkedIn Profile Data"
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedData, setImportedData] = useState<LinkedInData | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('LinkedIn URL daxil edin');
      return;
    }

    if (!url.includes('linkedin.com')) {
      setError('Düzgün LinkedIn URL daxil edin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/import/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setImportedData(data.data);
        setError('');
      } else {
        setError(data.error || 'LinkedIn import zamanı xəta baş verdi');
      }
    } catch (error: any) {
      console.error('LinkedIn import error:', error);
      setError(error.message || 'LinkedIn import zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = () => {
    if (importedData) {
      onImport(importedData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">LinkedIn Profil Import</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!importedData ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profil URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Import...' : 'Import'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Qeyd:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• LinkedIn profilinizin public olması lazımdır</li>
                <li>• URL formatı: https://www.linkedin.com/in/username</li>
                <li>• Import prosesi 10-30 saniyə çəkə bilər</li>
              </ul>
            </div>
          </div>
        ) : (
          // Import results display here
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Import Məlumatları</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Şəxsi Məlumatlar</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Ad:</strong> {importedData.personalInfo?.name || 'N/A'}</div>
                  <div><strong>E-poçt:</strong> {importedData.personalInfo?.email || 'N/A'}</div>
                  {importedData.personalInfo?.headline && (
                    <div><strong>Başlıq:</strong> {importedData.personalInfo.headline}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setImportedData(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Yenidən Cəhd Et
              </button>
              <button
                onClick={confirmImport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Import Et
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* Disabled version - if you want to disable again:
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">LinkedIn Import</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                LinkedIn Import Müvəqqəti Deaktivdir
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  LinkedIn profil import funksiyası hal-hazırda API subscription problemləri səbəbindən mövcud deyil.
                  Profil məlumatlarınızı manual şəkildə daxil edə bilərsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button onClick={onCancel} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
  */
}
