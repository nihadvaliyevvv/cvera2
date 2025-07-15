'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const { user, loading } = useAuth();

  const handleAuthSuccess = () => {
    // Auth success is handled by the AuthProvider
  };

  const handleCreateCV = () => {
    // Navigate to CV creation page
    window.location.href = '/cv/create';
  };

  const handleEditCV = (cvId: string) => {
    // Navigate to CV editing page
    window.location.href = `/cv/edit/${cvId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Yüklənir...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Dashboard 
        user={user} 
        onCreateCV={handleCreateCV}
        onEditCV={handleEditCV}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CVera
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Professional CV Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAuthMode('login')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  authMode === 'login' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Giriş
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  authMode === 'register' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Qeydiyyat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>AI-powered CV Builder</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Peşəkar CV-nizi
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> 
                    {' '}dəqiqələrlə yaradın
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  LinkedIn profilindən avtomatik import, professional template-lər və real-time önizləmə ilə 
                  CV yaratma prosesini asanlaşdırın.
                </p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">LinkedIn Import</span>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Premium Templates</span>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3.293 7.707A1 1 0 014 7h12a1 1 0 01.707.293A1 1 0 0117 8v6a1 1 0 01-.293.707A1 1 0 0116 15H4a1 1 0 01-.707-.293A1 1 0 013 14V8a1 1 0 01.293-.707zM5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">PDF & DOCX Export</span>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979.514.858.736 2.1.736 3.521 0 1.421-.222 2.663-.736 3.521C10.792 13.807 10.304 14 10 14c-.304 0-.792-.193-1.264-.979C8.222 12.163 8 10.921 8 9.5c0-1.421.222-2.663.736-3.521z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">Real-time Preview</span>
                </div>
              </div>
            </div>

            {/* Right side - Auth Card */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200/50">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {authMode === 'login' && 'Giriş'}
                    {authMode === 'register' && 'Qeydiyyat'}
                    {authMode === 'forgot' && 'Şifrə Bərpası'}
                  </h2>
                  <p className="text-gray-600">
                    {authMode === 'login' && 'Hesabınıza giriş edin və CV yaratmağa başlayın'}
                    {authMode === 'register' && 'Yeni hesab yaradın və professional CV-nizi hazırlayın'}
                    {authMode === 'forgot' && 'Şifrənizi bərpa etmək üçün email daxil edin'}
                  </p>
                </div>

                {authMode === 'login' && (
                  <LoginForm 
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setAuthMode('register')}
                    onSwitchToForgot={() => setAuthMode('forgot')}
                  />
                )}
                
                {authMode === 'register' && (
                  <RegisterForm 
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setAuthMode('login')}
                  />
                )}
                
                {authMode === 'forgot' && (
                  <ForgotPasswordForm 
                    onSwitchToLogin={() => setAuthMode('login')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                10K+
              </div>
              <div className="text-gray-600">Yaradılan CV</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                5K+
              </div>
              <div className="text-gray-600">Aktiv İstifadəçi</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                15+
              </div>
              <div className="text-gray-600">Template Variantı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CVera
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 CVera. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
