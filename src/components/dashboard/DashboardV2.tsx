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
  };
}

interface DashboardV2Props {
  user: User;
  onCreateCV: () => void;
  onEditCV: (cvId: string) => void;
}

export default function DashboardV2({ user, onCreateCV, onEditCV }: DashboardV2Props) {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Mouse tracking for cursor effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cvsResponse, limitsResponse] = await Promise.all([
        apiClient.get('/api/cv'),
        apiClient.get('/api/user/limits')
      ]);

      setCvs(cvsResponse.data.cvs || []);
      setUserLimits(limitsResponse.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - digər səhifələrdə olduğu kimi */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">CVera</span>
                <p className="text-xs text-gray-500 -mt-1">Professional CV Builder</p>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user.name?.charAt(0) || user.email.charAt(0)}</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Xoş gəlmisiniz!</p>
                  <p className="text-gray-600 -mt-1">{user.name || user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıxış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CV Dashboard
            <span className="block text-2xl font-normal text-gray-600 mt-2">Peşəkar CV-lərinizi idarə edin</span>
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cəmi CV-lər</p>
                <p className="text-3xl font-bold text-gray-900">{cvs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hesab Paketi</p>
                <p className="text-2xl font-bold text-gray-900">{userLimits?.userTier || 'Free'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Günlük Limit</p>
                <p className="text-2xl font-bold text-gray-900">{userLimits?.limits.dailyCVLimit || '∞'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* LinkedIn Import Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">LinkedIn Import</h3>
                <p className="text-gray-600 mt-1">Avtomatik profil import</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              LinkedIn profilinizi bir kliklə import edin və avtomatik olaraq CV yaradın. Sürətli və təhlükəsiz!
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Avtomatik məlumat doldurma
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                İş təcrübəsi və təhsil
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bacarıqlar və kompetensiyalar
              </div>
            </div>

            {/* Replace the LinkedInAutoImport component with direct implementation */}
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('accessToken');
                  if (!token) {
                    alert('Giriş tələb olunur');
                    return;
                  }

                  // Use the same working LinkedIn import API as CV create page
                  const response = await fetch('/api/import/linkedin-profile', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      linkedinUsername: 'musayevcreate' // Your LinkedIn username
                    })
                  });

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(result.error || 'LinkedIn import xətası');
                  }

                  if (result.success && result.cvId) {
                    console.log('✅ LinkedIn CV uğurla yaradıldı:', result.cvId);
                    
                    // CV-ni dashboarda göstərmək üçün CV siyahısını yenilə
                    await fetchDashboardData();
                    
                    // Yaradılan CV-ni redaktə etmək üçün yönləndir
                    router.push(`/cv/edit/${result.cvId}`);
                  } else {
                    throw new Error(result.error || 'CV yaradılmadı');
                  }

                } catch (error) {
                  console.error('❌ LinkedIn import xətası:', error);
                  alert(`LinkedIn import xətası: ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
                }
              }}
              className="w-full bg-blue-600 text-white rounded-xl px-6 py-4 hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              <div className="flex items-center justify-center">
                <span className="text-lg">LinkedIn profilimi import et</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Manual CV Creation Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Əl ilə Yaratma</h3>
                <p className="text-gray-600 mt-1">Sıfırdan CV yaradın</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Bütün məlumatları əl ilə daxil edərək peşəkar CV yaradın. Tam nəzarət sizin əlinizdədir!
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tam fərdiləşdirmə imkanı
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Detallı məlumat əlavə etmə
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI köməkliyi ilə
              </div>
            </div>

            <button
              onClick={onCreateCV}
              className="w-full bg-blue-600 text-white rounded-xl px-6 py-4 hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              <div className="flex items-center justify-center">
                <span className="text-lg">Yeni CV yaratmağa başla</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Existing CVs Section */}
        {cvs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Mövcud CV-lər</h2>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {cvs.length} CV
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
                  onClick={() => onEditCV(cv.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {cv.title}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 8v2m0-2v2m0-2h8a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8z" />
                          </svg>
                          {new Date(cv.createdAt).toLocaleDateString('az-AZ')}
                        </p>
                        <p className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {new Date(cv.updatedAt).toLocaleDateString('az-AZ')}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">CV</span>
                    <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                      Redaktə et →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cvs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hələ CV yaradılmayıb</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              İlk CV-nizi yaratmaq üçün yuxarıdakı seçimlərdən birini seçin. LinkedIn import və ya əl ilə yaratma.
            </p>
            <button
              onClick={onCreateCV}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            >
              İlk CV-mi yarat
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
