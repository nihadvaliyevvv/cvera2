'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  showAuthButtons?: boolean;
  currentPage?: 'home' | 'login' | 'register';
}

export default function Header({ showAuthButtons = true, currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
      {/* Improved responsive container with better edge spacing */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex justify-between items-center h-16 sm:h-18 md:h-20 lg:h-22 w-full">
          {/* Logo - Fixed size issues */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img
                src="public/cveralogo.png"
                alt="CVERA"
                className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto"
                style={{ maxWidth: '140px', height: 'auto' }}
              />
            </Link>
          </div>

          {/* Desktop Auth Buttons - Better spacing */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4 xl:space-x-6 flex-shrink-0">
              {currentPage !== 'login' && (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 lg:px-4 py-2 text-sm lg:text-base font-medium"
                >
                  Giriş
                </Link>
              )}
              {currentPage !== 'register' && (
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-semibold transition-colors duration-200 text-sm lg:text-base"
                >
                  Qeydiyyat
                </Link>
              )}
            </div>
          )}

          {/* Mobile menu button - Better sizing */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Improved */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 w-full">
            <div className="flex flex-col space-y-3">
              {showAuthButtons && (
                <div className="space-y-3">
                  {currentPage !== 'login' && (
                    <Link
                      href="/auth/login"
                      className="block bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Giriş
                    </Link>
                  )}
                  {currentPage !== 'register' && (
                    <Link
                      href="/auth/register"
                      className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Qeydiyyat
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
