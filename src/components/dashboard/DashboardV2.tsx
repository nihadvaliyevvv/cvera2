'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { User, useAuth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

interface CV {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface UserLimits {
  userTier: string;
  limits: {
    dailyCVLimit: number | string;
    allowedTemplates: string[];
    exportFormats: string[];
    supportType: string;
    allowImages: boolean;
  };
  todayUsage: {
    cvCreated: number;
    pdfExports: number;
    docxExports: number;
  };
  remaining: {
    cvCreations: number | string;
  };
  supportInfo: {
    type: string;
    description: string;
    contact?: string;
  };
}

interface DashboardV2Props {
  user: User;
  onCreateCV: () => void;
  onEditCV: (cvId: string) => void;
}

export default function DashboardV2({ user, onCreateCV, onEditCV }: DashboardV2Props) {
  const { logout } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCV, setDownloadingCV] = useState<{cvId: string, format: string} | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const userTier = user.subscriptions?.find(sub => sub.status === 'active')?.tier || 'Free';

  useEffect(() => {
    loadCVs();
    loadUserLimits();
    
    // Mouse tracking for cursor effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [user.id]);

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

  const loadUserLimits = async () => {
    try {
      const response = await fetch('/api/users/limits', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const limitsData = await response.json();
        setUserLimits(limitsData);
      }
    } catch (err) {
      console.error('Error loading user limits:', err);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!window.confirm('CV-ni silmək istədiyinizə əminsiniz?')) return;

    try {
      setError('');
      await apiClient.deleteCV(cvId);
      setCvs(prev => prev.filter(cv => cv.id !== cvId));
    } catch (err) {
      console.error('CV silmə xətası:', err);
      setError('CV silinərkən xəta baş verdi.');
    }
  };

  const handleDownloadCV = async (cvId: string, format: 'pdf' | 'docx') => {
    try {
      setError('');
      setDownloadingCV({ cvId, format });

      const response = await fetch(`/api/cvs/${cvId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorText = `Download failed: ${response.statusText}`;
        console.error(errorText);
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cv_${cvId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError(`${format.toUpperCase()} yüklənərkən xəta baş verdi.`);
    } finally {
      setDownloadingCV(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Premium': return 'from-yellow-400 to-orange-500';
      case 'Medium':
      case 'Orta': return 'from-blue-500 to-purple-600';
      case 'Pro': return 'from-blue-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Premium':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'Medium':
      case 'Orta':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Pro':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 cursor-none">
      {/* Custom Cursor */}
      <div
        className="fixed top-0 left-0 w-6 h-6 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-multiply transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px)`,
        }}
      />
      <div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-blue-300 rounded-full pointer-events-none z-40 transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 24}px, ${mousePosition.y - 24}px)`,
        }}
      />

      {/* Enhanced Professional Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-6">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white font-bold text-lg">CV</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CVERA</h1>
                  <p className="text-xs text-blue-600 font-medium tracking-wide">AI-Powered CV Builder</p>
                </div>
              </Link>
            </div>

            {/* Enhanced Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="relative text-gray-700 hover:text-blue-600 font-semibold transition-colors group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/templates" className="relative text-gray-700 hover:text-blue-600 font-semibold transition-colors group">
                Şablonlar
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/pricing" className="relative text-gray-700 hover:text-blue-600 font-semibold transition-colors group">
                Qiymətlər
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Enhanced User Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Enhanced User Tier Badge */}
              <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                userTier === 'Premium' 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-yellow-200' 
                  : userTier === 'Pro'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-purple-200'
                  : userTier === 'Medium' || userTier === 'Orta'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-blue-200'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {getTierIcon(userTier)}
                  <span>{userTier} Plan</span>
                </div>
              </div>

              {/* Enhanced User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-100/80 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Enhanced Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-3">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          userTier === 'Premium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : userTier === 'Pro'
                            ? 'bg-purple-100 text-purple-800'
                            : userTier === 'Medium' || userTier === 'Orta'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {getTierIcon(userTier)}
                          <span className="ml-1">{userTier} Plan</span>
                        </span>
                      </div>
                    </div>
                    <Link href="/profile" className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profil Tənzimləmələri</span>
                    </Link>
                    <Link href="/settings" className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Hesab Tənzimləmələri</span>
                    </Link>
                    <Link href="/billing" className="flex items-center space-x-3 px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Ödəniş & Faktura</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={logout}
                        className="flex items-center space-x-3 w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Hesabdan Çıx</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with improved design */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50/90 backdrop-blur-sm border-l-4 border-red-400 rounded-r-xl shadow-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ffffff" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                      Xoş gəlmisiniz, {user.name}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg lg:text-xl font-medium">
                      AI ilə professional CV yaradın və karyera yolunuzu uğurla davam etdirin.
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cvs.length}</div>
                    <div className="text-blue-200 text-sm">CV Sayı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userLimits?.todayUsage.cvCreated || 0}</div>
                    <div className="text-blue-200 text-sm">Bu Gün</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userTier}</div>
                    <div className="text-blue-200 text-sm">Plan</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <button
            onClick={onCreateCV}
            className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 group-hover:text-white transition-colors duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Yeni CV Yarat</h3>
              <p className="text-gray-600 group-hover:text-blue-100">AI dəstəyi ilə peşəkar CV hazırlayın</p>
            </div>
          </button>

          <Link href="/templates" className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 group-hover:text-white transition-colors duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">CV Şablonları</h3>
              <p className="text-gray-600 group-hover:text-emerald-100">Professional şablonlar kolleksiyası</p>
            </div>
          </Link>

          <div className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 group-hover:text-white transition-colors duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Statistikalar</h3>
              <p className="text-gray-600 group-hover:text-purple-100">CV performans analitikası</p>
            </div>
          </div>
        </div>

        {/* User Limits Info */}
        {userLimits && (
          <div className="mb-10 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Plan Məlumatları
              </h2>
              <Link href="/pricing" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium">
                Planı Yüksəlt
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {typeof userLimits.remaining.cvCreations === 'number'
                    ? userLimits.remaining.cvCreations 
                    : '∞'}
                </div>
                <div className="text-sm text-gray-600 font-medium">Qalan CV limiti</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {userLimits.todayUsage.cvCreated}
                </div>
                <div className="text-sm text-gray-600 font-medium">Bu gün yaradılan CV</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userLimits.limits.allowedTemplates.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">İstifadə edilən şablon</div>
              </div>
            </div>
          </div>
        )}

        {/* CV List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/60 overflow-hidden shadow-lg">
          <div className="p-8 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CV-ləriniz ({cvs.length})
              </h2>
              <button
                onClick={onCreateCV}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni CV</span>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">CV-lər yüklənir...</p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hələ CV yaratmamısınız</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">İlk professional CV-nizi yaratmaq üçün aşağıdakı düyməni basın və karyera yolunuza başlayın.</p>
              <button
                onClick={onCreateCV}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                İlk CV-ni yarat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/60">
              {cvs.map((cv) => (
                <div key={cv.id} className="p-8 hover:bg-gray-50/50 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cv.title}</h3>
                          <p className="text-sm text-gray-500">
                            Yaradılıb: {formatDate(cv.createdAt)}
                            {cv.updatedAt !== cv.createdAt && (
                              <span> • Yenilənib: {formatDate(cv.updatedAt)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onEditCV(cv.id)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="Redaktə et"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadCV(cv.id, 'pdf')}
                        disabled={downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf'}
                        className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 disabled:opacity-50 hover:shadow-md"
                        title="PDF yüklə"
                      >
                        {downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf' ? (
                          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h8.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                        title="Sil"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
