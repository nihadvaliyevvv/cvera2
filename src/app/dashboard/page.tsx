'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DashboardV2 from '@/components/dashboard/DashboardV2';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to prevent flash of white screen
    const timer = setTimeout(() => {
      if (!loading && !user) {
        // Redirect to home page instead of root
        window.location.replace('https://cvera.net');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  // Show loading spinner while authenticating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated to prevent white screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Giriş tələb olunur</p>
            <button
              onClick={() => window.location.replace('https://cvera.net')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ana səhifəyə qayıt
            </button>
          </div>
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
