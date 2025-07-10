'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Dashboard from '@/components/dashboard/Dashboard';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleCreateCV = () => {
    router.push('/cv/create');
  };

  const handleEditCV = (cvId: string) => {
    router.push(`/cv/edit/${cvId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dashboard
      user={user}
      onCreateCV={handleCreateCV}
      onEditCV={handleEditCV}
    />
  );
}
