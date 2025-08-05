'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function StandardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('🚪 StandardHeader: Logout butonuna basıldı');
      console.log('🚪 StandardHeader: Logout funksiyasını çağırıram...');

      logout(); // Remove await - logout function handles everything internally

      console.log('🚪 StandardHeader: Logout funksiyası çağırıldı');
      // Remove any additional redirects - logout() already handles redirection
    } catch (error) {
      console.error('❌ StandardHeader: Logout error:', error);
      // Fallback redirect only if logout completely fails
      window.location.href = '/auth/login';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 sticky top-0 z-40 shadow-lg">
      {/* Enhanced responsive container with better edge spacing */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
          {/* Logo - Fixed sizing */}
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/cveralogo-2.png"
              alt="CVera Logo"
              className="h-8 sm:h-9 md:h-10 w-auto"
              style={{ maxWidth: '140px', height: 'auto' }}
            />
          </Link>

          {/* Navigation Menu - Better responsive spacing */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            <Link href="/dashboard" className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base">
              Dashboard
            </Link>
            <Link href="/cv-list" className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base">
              CV-lərim
            </Link>
            <Link href="/linkedin-import" className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base">
              LinkedIn Import
            </Link>
            <Link href="/pricing" className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base">
              Qiymətlər
            </Link>
          </nav>

          {/* User Info & Logout - Enhanced responsive design */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* User Info - Better responsive behavior */}
            <Link
              href="/profile/edit"
              className="hidden lg:flex items-center space-x-2 xl:space-x-3 bg-white/10 backdrop-blur-sm px-3 xl:px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
            >
              <div className="w-7 h-7 xl:w-8 xl:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white text-xs xl:text-sm font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-sm xl:text-base">
                <p className="font-medium text-white">Xoş gəlmisiniz!</p>
                <p className="text-blue-100 -mt-1 text-xs xl:text-sm">{user?.name || user?.email || 'İstifadəçi'}</p>
              </div>
              <svg className="w-3 h-3 xl:w-4 xl:h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Mobile menu button - Better sizing with onClick handler */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                // Close icon when menu is open
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon when menu is closed
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* Logout Button - Enhanced responsive design */}
            <button
              onClick={() => {
                console.log('🔴 LOGOUT BUTTON CLICKED - TEST');
                handleLogout();
              }}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Çıxış
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-gradient-to-r from-blue-600 to-blue-700 border-t border-blue-500/50 shadow-xl z-50">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Navigation Links */}
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/cv-list"
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                CV-lərim
              </Link>
              <Link
                href="/linkedin-import"
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                LinkedIn Import
              </Link>
              <Link
                href="/pricing"
                onClick={closeMobileMenu}
                className="block py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
              >
                Qiymətlər
              </Link>

              {/* Mobile User Profile */}
              <div className="border-t border-white/20 pt-3 mt-3">
                <Link
                  href="/profile/edit"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 py-3 px-4 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">Profil</p>
                    <p className="text-blue-100 text-xs">{user?.name || user?.email || 'İstifadəçi'}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
