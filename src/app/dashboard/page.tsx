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

  // Yükləmə zamanı göstərilən ekran
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

  // Giriş yoxdursa yönləndirmə zamanı göstərilən ekran
  if (!user || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 text-center">Giriş səhifəsinə yönləndirilib...</p>
        </div>
      </div>
    );
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
