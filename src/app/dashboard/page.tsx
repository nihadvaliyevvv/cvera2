'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import DashboardV2 from '@/components/dashboard/DashboardV2';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for auth to be fully initialized before redirecting
    if (isInitialized && !loading) {
      // Only redirect if we're sure there's no user
      if (!user && !isRedirecting) {
        console.log('🔄 No user found, redirecting to login...');
        setIsRedirecting(true);
        router.replace('/auth/login');
      } else if (user) {
        // Clear redirecting flag if user is found
        setIsRedirecting(false);
        console.log('✅ User found in dashboard:', user.email);
      }
    }
  }, [user, loading, isInitialized, router, isRedirecting]);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard state:', {
      user: !!user,
      loading,
      isInitialized,
      isRedirecting,
      userEmail: user?.email
    });
  }, [user, loading, isInitialized, isRedirecting]);

  // Show loading spinner while auth is initializing
  if (!isInitialized || loading) {
    return <LoadingSpinner />;
  }

  // Show loading while redirecting
  if (isRedirecting) {
    return <LoadingSpinner />;
  }

  // If no user after initialization, let useEffect handle redirect
  if (!user) {
    return <LoadingSpinner />;
  }

  const handleEditCV = (cvId: string) => {
    router.push(`/cv/edit/${cvId}`);
  };

  return (
    <DashboardV2
      user={user!}
      onEditCV={handleEditCV}
    />
  );
}
