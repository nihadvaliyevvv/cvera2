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
    // More robust authentication check
    const checkAuth = () => {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('accessToken');

      if (!loading) {
        if (!user && !token) {
          // No user and no token - redirect immediately
          console.log('No authentication found, redirecting to landing...');
          window.location.href = 'https://cvera.net';
          return;
        }

        if (!user && token) {
          // We have a token but no user data yet - wait a bit more
          setTimeout(() => {
            if (!user) {
              console.log('Token exists but no user data, redirecting...');
              window.location.href = 'https://cvera.net';
            }
          }, 2000);
        }
      }
    };

    checkAuth();
  }, [user, loading]);

  // Additional check on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found on mount, redirecting...');
      window.location.href = 'https://cvera.net';
    }
  }, []);

  // Show loading spinner while authenticating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Authentikasiya yoxlanılır...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show minimal loading while redirect happens
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Yönləndirilib...</p>
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
