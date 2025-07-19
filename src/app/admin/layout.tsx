'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setIsAdmin(data.success);
    } catch (error) {
      console.error('Admin verification failed:', error);
      setIsAdmin(false);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Giriş rədd edildi</h1>
          <p className="text-gray-600 mb-4">Bu səhifəyə giriş üçün admin icazəniz yoxdur</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard-a qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
            </div>
            <nav className="flex space-x-6">
              <Link 
                href="/admin" 
                className="hover:text-red-200 transition-colors"
              >
                Ana səhifə
              </Link>
              <Link 
                href="/admin/users" 
                className="hover:text-red-200 transition-colors"
              >
                İstifadəçilər
              </Link>
              <Link 
                href="/admin/subscriptions" 
                className="hover:text-red-200 transition-colors"
              >
                Abunəliklər
              </Link>
              <Link 
                href="/admin/analytics" 
                className="hover:text-red-200 transition-colors"
              >
                Analitika
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
