'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DashboardV2 from '@/components/dashboard/DashboardV2';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Simple auth check - only redirect if definitely not authenticated
    if (isInitialized && !loading && !user) {
      // Clear any stale tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Use Next.js router for better navigation
      router.replace('/');
    }
  }, [user, loading, isInitialized, router]);

  // Show loading while initializing or if we're about to redirect
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // If no user after initialization, show loading (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Giriş yoxlanılır...</p>
        </div>
      </div>
    );
  }

  const handleCreateCV = () => {
    router.push('/cv/create');
  };

  const handleEditCV = (cvId: string) => {
    router.push(`/cv/edit/${cvId}`);
  };

  return (
    <DashboardV2
      user={user}
      onCreateCV={handleCreateCV}
      onEditCV={handleEditCV}
    />
  );
}
