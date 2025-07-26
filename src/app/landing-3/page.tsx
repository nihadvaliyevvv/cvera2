'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function Landing3Page() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleCreateCV = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/register');
    }
  };

  const handlePreviewTemplates = () => {
    router.push('/templates');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/cveralogo.svg"
                alt="CVERA Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-gray-900">CVERA</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/templates" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Şablonlar</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Qiymətlər</Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Kömək</Link>
            </div>

            <button
              onClick={handleCreateCV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Başla
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Peşəkar CV-nizi dəqiqələrdə yaradın
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                LinkedIn məlumatlarınızı bir kliklə idxal edin və CV-nizi dərhal yaratmağa başlayın.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCreateCV}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                İndi Başla
              </button>

              <button
                onClick={handlePreviewTemplates}
                className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
              >
                Şablonları Gör
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Dizayn Bacarığı Lazım Deyil</h3>
                <p className="text-gray-600 text-sm">Peşəkar şablonlarla gözəl CV yaradın</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Sürətli və Asan</h3>
                <p className="text-gray-600 text-sm">İstəkli rehbərlik ilə CV yaradın</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">PDF, Word və Daha Çox</h3>
                <p className="text-gray-600 text-sm">Müxtəlif formatlarda ixrac edin</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl shadow-xl">
              {/* CV Mockup */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-white/30 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-white/20 rounded w-24"></div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                    </div>
                  </div>

                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-100 rounded w-32"></div>
                        <div className="h-3 bg-blue-200 rounded w-16"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-100 rounded w-28"></div>
                        <div className="h-3 bg-blue-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 bg-blue-100 rounded-lg"></div>
                      <div className="h-8 bg-blue-100 rounded-lg"></div>
                      <div className="h-8 bg-blue-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-bounce">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Canlı önizləmə</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">PDF ixrac</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Uğurlu karyera üçün bütün alətlər
          </h2>

          <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
            Peşəkar CV yaratmaq üçün dizaynera ehtiyacınız yoxdur. CVERA alətləri ilə
            rezümənizi saatlarla deyil, dəqiqələrlə tamamlayacaqsınız.
          </p>

          <button
            onClick={handleCreateCV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Pulsuz Başla
          </button>
        </div>
      </section>

      {/* Sticky CTA Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <button
          onClick={handleCreateCV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
        >
          CV-mi Hazırla
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/cveralogo.svg"
                  alt="CVERA Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900">CVERA</span>
              </div>
              <p className="text-gray-600">
                Peşəkar CV yaradıcısı ilə karyeranızı inkişaf etdirin.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Məhsullar</h3>
              <ul className="space-y-3">
                <li><Link href="/templates" className="text-gray-600 hover:text-blue-600 transition-colors">CV Şablonları</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">LinkedIn İdxal</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">AI Köməkçisi</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Dəstək</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">İstifadə Şərtləri</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Məxfilik</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Kömək Mərkəzi</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Əlaqə</h3>
              <ul className="space-y-3">
                <li className="text-gray-600">info@cvera.az</li>
                <li className="text-gray-600">+994 XX XXX XX XX</li>
                <li className="text-gray-600">Bakı, Azərbaycan</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500">
              © 2025 CVERA. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        @media (max-width: 640px) {
          .fixed.right-8.bottom-8 {
            right: 1rem;
            bottom: 1rem;
          }
          
          .fixed button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
