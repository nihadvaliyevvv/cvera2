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
    // Sadə giriş yoxlaması - giriş yoxdursa login səhifəsinə yönləndir
    if (isInitialized && !loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/auth/login');
    }
  }, [user, loading, isInitialized, router, isRedirecting]);

  // Show loading spinner while auth is loading or user is not loaded yet
  if (loading || !isInitialized || !user) {
    return <LoadingSpinner />;
  }

  const handleEditCV = (cvId: string) => {
    router.push(`/cv/edit/${cvId}`);
  };

  return (
    <DashboardV2
      user={user}
      onEditCV={handleEditCV}
    />
  );
}
