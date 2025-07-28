'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DashboardV2 from '@/components/dashboard/DashboardV2';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only run auth check after auth system is fully initialized
    if (!isInitialized) return;

    const checkAuthAndRedirect = async () => {
      // Check if we have a valid token in localStorage
      const token = localStorage.getItem('accessToken');

      // If no user and no token after initialization, redirect to home
      if (!user && !token && !loading) {
        console.log('No authentication found, redirecting to home...');
        setRedirecting(true);

        // Clear any existing auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Redirect to home page
        window.location.href = '/';
        return;
      }

      // If we have a token but no user data after initialization, something is wrong
      if (token && !user && !loading) {
        console.log('Token exists but authentication failed, clearing and redirecting...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setRedirecting(true);

        // Redirect to home page
        window.location.href = '/';
        return;
      }
    };

    // Add a small delay to prevent immediate redirects on page load
    const timeoutId = setTimeout(checkAuthAndRedirect, 500);
    return () => clearTimeout(timeoutId);
  }, [user, loading, isInitialized, router]);

  // Show loading spinner while authenticating or initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Authentikasiya yoxlanılır...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (redirecting || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Ana səhifəyə yönləndirilib...</p>
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
