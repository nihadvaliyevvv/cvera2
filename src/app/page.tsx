'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Yüklənir...</div>
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
  }  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-600 shadow-lg border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">CVera</h1>
              </div>
              <span className="ml-3 text-sm text-blue-100 bg-blue-500 px-2 py-1 rounded-full">Professional CV Platform</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Peşəkar CV-nizi 
              <span className="text-blue-600"> asanlıqla yaradın</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              LinkedIn profilindən avtomatik import, professional template-lər və PDF/DOCX formatında yükləmə imkanı.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">LinkedIn profilindən avtomatik import</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Professional template-lər</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">PDF və DOCX formatında yükləmə</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Real-time önizləmə</span>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {authMode === 'login' ? 'Giriş' : 'Qeydiyyat'}
              </h2>
              <p className="text-gray-600 text-center">
                {authMode === 'login' ? 'Hesabınıza giriş edin' : 'Yeni hesab yaradın'}
              </p>
            </div>
            
            {authMode === 'login' ? (
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
