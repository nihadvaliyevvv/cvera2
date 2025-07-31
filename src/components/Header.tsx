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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/cveralogo.png"
                alt="CVERA"
                className="h-5 w-auto sm:h-5 md:h-5 lg:h-6"
                style={{ width: '150px', height: 'auto' }} // Logo ölçüs
              />

            </Link>
          </div>



          {/* Desktop Auth Buttons */}
          {showAuthButtons && (
            <div className="hidden md:flex items-center space-x-4">
              {currentPage !== 'login' && (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-4 py-2"
                >
                  Giriş
                </Link>
              )}
              {currentPage !== 'register' && (
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Qeydiyyat
                </Link>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">

              {showAuthButtons && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {currentPage !== 'login' && (
                    <Link
                      href="/auth/login"
                      className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 mx-4 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Giriş
                    </Link>

                  )}<br />
                  {currentPage !== 'register' && (
                    <Link
                      href="/auth/register"
                      className="block bg-blue-600 hover:bg-blue-700  text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 mx-4 text-center"
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
