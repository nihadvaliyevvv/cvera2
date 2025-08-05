'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem('admin-token');
        if (!token) {
          router.push('/error/login');
          return;
        }

        const response = await fetch('/api/system/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('admin-token');
          router.push('/error/login');
          return;
        }

        const data = await response.json();
        setAdmin(data.admin);
      } catch (error) {
        console.error('Admin verification error:', error);
        localStorage.removeItem('admin-token');
        router.push('/error/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/system/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin-token');
      router.push('/error/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58b4e4]"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/sistem" className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
                <img src="/cveralogo.png" alt="CVERA Logo" className="w-8 h-8" />
                <span>CVERA İdarə Paneli</span>
              </Link>
              <div className="ml-6 flex space-x-4">
                <Link
                  href="/sistem"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  İdarə Paneli
                </Link>
                <Link
                  href="/sistem/users"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  İstifadəçilər
                </Link>
                <Link
                  href="/sistem/api-keys"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  API Açarları
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Xoş gəlmisiniz, {admin.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Çıxış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
