'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function Landing2Page() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-600 to-purple-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-blue-500/20 to-purple-700/20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/cveralogo.svg"
                alt="CVERA Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold text-white">CVERA</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-white/90 hover:text-white transition-colors">Məhsullar</Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">Həllər</Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">Qiymətlər</Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">Karyera</Link>
              <Link href="#" className="text-white/90 hover:text-white transition-colors">Əlaqə</Link>
            </div>

            <button
              onClick={handleCreateCV}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              CV Yarat
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Peşəkar </span>
                <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  CV Yaradıcısı
                </span>
              </h1>

              <p className="text-xl text-white/90 leading-relaxed max-w-lg">
                Profesional CV-nizi dəqiqələr içində yaradın. Modern dizayn,
                asan istifadə və karyera uğurunuz üçün mükəmməl həllər.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCreateCV}
                className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                İndi Başla
              </button>

              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                Nümunələri Gör
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/20">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-white font-semibold mb-2">Sürətli</h3>
                <p className="text-white/80 text-sm">5 dəqiqədə hazır CV</p>
              </div>

              <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/20">
                <div className="text-3xl mb-4">🎨</div>
                <h3 className="text-white font-semibold mb-2">Modern</h3>
                <p className="text-white/80 text-sm">Professional dizaynlar</p>
              </div>

              <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl border border-white/20">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-white font-semibold mb-2">Mobil</h3>
                <p className="text-white/80 text-sm">Hər yerdə istifadə edin</p>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Element */}
          <div className="relative">
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-white/20 rounded-full w-32 mb-2"></div>
                    <div className="h-3 bg-white/15 rounded-full w-24"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-3 bg-white/20 rounded-full w-full"></div>
                  <div className="h-3 bg-white/15 rounded-full w-5/6"></div>
                  <div className="h-3 bg-white/15 rounded-full w-4/6"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl">
                    <div className="h-3 bg-white/20 rounded-full w-full mb-2"></div>
                    <div className="h-2 bg-white/15 rounded-full w-3/4"></div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 p-4 rounded-xl">
                    <div className="h-3 bg-white/20 rounded-full w-full mb-2"></div>
                    <div className="h-2 bg-white/15 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky CTA Button */}
      <div className="fixed right-8 bottom-8 z-50">
        <button
          onClick={handleCreateCV}
          className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          CV-mi Hazırla
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-white/5 border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/cveralogo.svg"
                  alt="CVERA Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-white">CVERA</span>
              </div>
              <p className="text-white/70">
                Peşəkar CV yaradıcısı ilə karyeranızı inkişaf etdirin.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Məhsullar</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-white/70 hover:text-white transition-colors">CV Yaradıcısı</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Şablonlar</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white transition-colors">AI Köməkçisi</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Dəstək</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">Şərtlər</Link></li>
                <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">Məxfilik</Link></li>
                <li><Link href="#" className="text-white/70 hover:text-white transition-colors">Kömək</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Əlaqə</h3>
              <ul className="space-y-2">
                <li className="text-white/70">info@cvera.az</li>
                <li className="text-white/70">+994 XX XXX XX XX</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60">
              © 2025 CVERA. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
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
