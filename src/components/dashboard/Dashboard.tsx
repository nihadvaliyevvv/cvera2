'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/lib/auth';
import ProfileEditor from '@/components/profile/ProfileEditor';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';

interface CV {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardProps {
  user: User;
  onCreateCV: () => void;
  onEditCV: (cvId: string) => void;
}

export default function Dashboard({ user, onCreateCV, onEditCV }: DashboardProps) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCV, setDownloadingCV] = useState<{cvId: string, format: string} | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({ 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    createdAt: user.createdAt,
    subscriptions: user.subscriptions 
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'subscription'>('dashboard');

  const userTier = currentUser.subscriptions?.find(sub => sub.status === 'active')?.tier || 'Free';

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      const result = await apiClient.getCVs();
      setCvs(result);
    } catch (err) {
      setError('CV-lər yüklənərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!window.confirm('CV-ni silmək istədiyinizə əminsiniz?')) return;
    
    try {
      setError(''); // Clear any previous errors
      const result = await apiClient.deleteCV(cvId);
      console.log('CV silindi:', result);
      
      // Remove CV from local state
      setCvs(prev => prev.filter(cv => cv.id !== cvId));
      
      // Show success message (optional)
      // You could add a success notification here
      
    } catch (err) {
      console.error('CV silmə xətası:', err);
      
      // More detailed error message
      let errorMessage = 'CV silinərkən xəta baş verdi.';
      if (err instanceof Error) {
        errorMessage += ' ' + err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDownloadCV = async (cvId: string, format: 'pdf' | 'docx') => {
    try {
      setError(''); // Clear any previous errors
      setDownloadingCV({ cvId, format });
      
      console.log(`Starting ${format.toUpperCase()} download for CV:`, cvId);
      
      const response = await fetch(`/api/cvs/${cvId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Download failed: ${response.status} ${response.statusText}`);
      }

      // Handle direct download response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get CV title for filename
      const cv = cvs.find(c => c.id === cvId);
      const filename = `${cv?.title || 'CV'}.${format}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log(`${format.toUpperCase()} file downloaded successfully`);
      
    } catch (err) {
      console.error(`${format.toUpperCase()} download error:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Naməlum xəta baş verdi';
      setError(`${format.toUpperCase()} yükləmə xətası: ${errorMessage}`);
    } finally {
      setDownloadingCV(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Abunəlik
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Cəmi CV-lər</dt>
                      <dd className="text-lg font-medium text-gray-900">{cvs.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Abunəlik</dt>
                      <dd className="text-lg font-medium text-gray-900">{userTier}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Üçün üzv</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentUser.createdAt ? new Date(String(currentUser.createdAt)).toLocaleDateString('az-AZ') : 'Məlumat yoxdur'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Sürətli Əməliyyatlar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={onCreateCV}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Yeni CV Yarat
                </button>
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profili Redaktə Et
                </button>
              </div>
            </div>

            {/* CVs List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">CV-lər</h2>
              </div>
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">CV-lər yüklənir...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">
                  <p>{error}</p>
                </div>
              ) : cvs.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Hələ CV yaratmamısınız. İlk CV-nizi yaratmaq üçün yuxarıdakı düyməyə basın.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cvs.map((cv) => (
                    <div key={cv.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{cv.title}</h3>
                          <p className="text-sm text-gray-500">
                            Yaradılıb: {new Date(cv.createdAt).toLocaleDateString('az-AZ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Yenilənib: {new Date(cv.updatedAt).toLocaleDateString('az-AZ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onEditCV(cv.id)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Redaktə et
                          </button>
                          <button
                            onClick={() => handleDownloadCV(cv.id, 'pdf')}
                            disabled={downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf'}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf' ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Yüklənir...
                              </span>
                            ) : (
                              'PDF'
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadCV(cv.id, 'docx')}
                            disabled={downloadingCV?.cvId === cv.id && downloadingCV?.format === 'docx'}
                            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingCV?.cvId === cv.id && downloadingCV?.format === 'docx' ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Yüklənir...
                              </span>
                            ) : (
                              'DOCX'
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil Məlumatları</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad
                  </label>
                  <p className="text-gray-900">{currentUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{currentUser.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qeydiyyat tarixi
                  </label>
                  <p className="text-gray-900">
                    {currentUser.createdAt ? new Date(String(currentUser.createdAt)).toLocaleDateString('az-AZ') : 'Məlumat yoxdur'}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Profili Redaktə Et
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <SubscriptionManagement user={currentUser} onUserUpdate={handleUserUpdate} />
        )}
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor
          user={currentUser}
          onUserUpdate={handleUserUpdate}
          onClose={() => setShowProfileEditor(false)}
        />
      )}
    </div>
  );
}
