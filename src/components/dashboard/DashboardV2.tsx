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
  const router = useRouter();
  const { logout } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingCV, setDownloadingCV] = useState<{cvId: string, format: string} | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'cvs' | 'analytics' | 'settings'>('overview');

  const userTier = user.subscriptions?.find(sub => sub.status === 'active')?.tier || 'Free';

  useEffect(() => {
    loadCVs();
    loadUserLimits();
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
        throw new Error(`Download failed: ${response.statusText}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-emerald-400/30 rounded-full animate-ping"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center group">
              <Image
                src="/cveralogo.svg" 
                alt="CVERA Logo" 
                width={120}
                height={48}
                className="h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {[
                { id: 'overview', label: 'Ümumi baxış', icon: '📊' },
                { id: 'cvs', label: 'CV-lərim', icon: '📄' },
                { id: 'analytics', label: 'Analitika', icon: '📈' },
                { id: 'settings', label: 'Tənzimləmələr', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Tier Badge */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getTierColor(userTier)} text-white text-sm font-medium shadow-lg`}>
                {getTierIcon(userTier)}
                <span>{userTier}</span>
              </div>

              {/* User Avatar */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profil</span>
                  </button>
                  <Link href="/pricing" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Abunəlik</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Çıxış</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Content Sections */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Xoş gəlmisiniz, {user.name}! 👋
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Professional CV-nizi yaradın və karyeranızı irəlilətmə üçün hazır olun
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ümumi CV</p>
                    <p className="text-2xl font-bold text-gray-900">{cvs.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bu gün yaradılan</p>
                    <p className="text-2xl font-bold text-gray-900">{userLimits?.todayUsage?.cvCreated || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">PDF İxracı</p>
                    <p className="text-2xl font-bold text-gray-900">{userLimits?.todayUsage?.pdfExports || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Qalan limit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof userLimits?.remaining?.cvCreations === 'number' 
                        ? userLimits.remaining.cvCreations 
                        : '∞'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tez əməliyyatlar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={onCreateCV}
                  className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-semibold">Yeni CV yarat</span>
                </button>

                <Link
                  href="/templates"
                  className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="font-semibold">Şablonlara bax</span>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="font-semibold">Premium al</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cvs' && (
          <div className="space-y-8">
            {/* CV Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">CV-lərim</h2>
                <p className="text-gray-600 mt-1">Yaratdığınız CV-ləri idarə edin və yeniləyin</p>
              </div>
              <button
                onClick={onCreateCV}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">Yeni CV</span>
              </button>
            </div>

            {/* CV List */}
            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">CV-lər yüklənir...</span>
                </div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Hələ CV yaratmamısınız</h3>
                <p className="text-gray-600 mb-6">İlk CV-nizi yaradın və karyeranızı başladın</p>
                <button
                  onClick={onCreateCV}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  İlk CV-ni yarat
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvs.map((cv) => (
                  <div key={cv.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {cv.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Yaradılıb: {formatDate(cv.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Yenilənib: {formatDate(cv.updatedAt)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditCV(cv.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Redaktə et
                      </button>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDownloadCV(cv.id, 'pdf')}
                          disabled={downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf'}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          title="PDF yüklə"
                        >
                          {downloadingCV?.cvId === cv.id && downloadingCV?.format === 'pdf' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleDownloadCV(cv.id, 'docx')}
                          disabled={downloadingCV?.cvId === cv.id && downloadingCV?.format === 'docx'}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          title="DOCX yüklə"
                        >
                          {downloadingCV?.cvId === cv.id && downloadingCV?.format === 'docx' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteCV(cv.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          title="Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analitika Bölməsi</h3>
              <p className="text-gray-600 mb-6">Detallı analitika və statistikalar tezliklə əlavə ediləcək</p>
              <div className="text-sm text-purple-600 bg-purple-50 rounded-lg p-3 inline-block">
                🚀 Gələcək versiyada mövcud olacaq
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Hesab tənzimləmələri</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Ad</h4>
                    <p className="text-gray-600">{user.name}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Dəyişdir</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">E-mail</h4>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Dəyişdir</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Şifrə</h4>
                    <p className="text-gray-600">••••••••</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">Dəyişdir</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Abunəlik planı</h4>
                    <p className="text-gray-600">{userTier}</p>
                  </div>
                  <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                    Planı dəyişdir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
