'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Footer əlavə edirik

export default function LoginPage() {
  // All hooks must be called at the top level, before any early returns
  const { user, loading: authLoading, isInitialized, fetchCurrentUser } = useAuth();
  const router = useRouter();

  // All useState hooks must be called in the same order every time
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // All useEffect hooks must also be at the top level
  // Redirect if already authenticated
  useEffect(() => {
    // Only redirect if we're fully initialized and definitely have a user
    if (isInitialized && !authLoading && user) {
      console.log('User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, authLoading, isInitialized, router]);

  // Set custom validation messages for Azerbaijani
  useEffect(() => {
    const setCustomValidationMessages = () => {
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;

      if (emailInput) {
        emailInput.setCustomValidity('');

        // Set initial custom validity for empty field
        if (!emailInput.value.trim()) {
          emailInput.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
        }

        emailInput.oninput = function() {
          (this as HTMLInputElement).setCustomValidity('');
        };

        emailInput.oninvalid = function() {
          const target = this as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.typeMismatch) {
            target.setCustomValidity('Zəhmət olmasa düzgün email ünvanı daxil edin');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
      }

      if (passwordInput) {
        passwordInput.setCustomValidity('');

        // Set initial custom validity for empty field
        if (!passwordInput.value.trim()) {
          passwordInput.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
        }

        passwordInput.oninput = function() {
          (this as HTMLInputElement).setCustomValidity('');
        };

        passwordInput.oninvalid = function() {
          const target = this as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.tooShort) {
            target.setCustomValidity('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
      }
    };

    // Apply validation with delay to ensure DOM is ready
    const timer = setTimeout(setCustomValidationMessages, 500);

    return () => clearTimeout(timer);
  }, []);



  // Don't render login form if user is authenticated (extra safety check)
  if (user) {
    return (
      <div className="app-background flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Yönləndirilib...</p>
        </div>
      </div>
    );
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation for login
    if (!formData.email || !formData.password) {
      setError('Bütün sahələri doldurun');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Düzgün e-poçt ünvanı daxil edin');
      setLoading(false);
      return;
    }

    // Password minimum length check
    if (formData.password.length < 8) {
      setError('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Token-i localStorage-a saxla
        localStorage.setItem('accessToken', data.token);

        // Auth context-ini manual olaraq yenilə ki, dərhal user məlumatları yükləsin
        try {
          await fetchCurrentUser();
        } catch (error) {
          console.log('Auth context yenilənmədi, amma davam edirik');
        }

        // Loading state-i bir az daha uzat ki, auth context yenilənsə
        setTimeout(() => {
          setLoading(false);
          // window.location.href istifadə et ki, tam səhifə yenilənsə və auth context düzgün yüklənsə
          window.location.href = '/dashboard';
        }, 500);

        return; // handleSubmit-i burada bitir
      } else {
        setError(data.error || 'Giriş zamanı xəta baş verdi');
      }
    } catch (error) {
      setError('Şəbəkə xətası baş verdi');
    } finally {
      // Yalnız error vəziyyətində loading-i dərhal dayandır
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
      }
    }
  };

  const handleLinkedInLogin = () => {
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header currentPage="login" />

      {/* Main Content with Enhanced Responsive Container - Premium Edge Spacing */}
      <div className="w-full max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8 sm:py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100" style={{ borderWidth: '2px', borderColor: '#3b82f6' }}>
            {/* Login Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Xoş gəlmisiniz!</h1>
              <p className="text-gray-600">Hesabınıza daxil olun</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-poçt ünvanı
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="numune@cvera.net"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrə
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                    placeholder="Şifrənizi daxil edin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L19.5 19.5" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Daxil olunur...</span>
                  </div>
                ) : (
                  'Daxil olun'
                )}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">və ya</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* LinkedIn Login Button */}
            <button
              onClick={handleLinkedInLogin}
              disabled={loading}
              className="w-full bg-[#1e40af] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005885] focus:ring-2 focus:ring-[#0077B5] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn ilə daxil olun</span>
            </button>

            {/* Links */}
            <div className="mt-6 text-center space-y-4">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Şifrəni unutmusunuz?
              </Link>

              <div className="text-sm text-gray-600">
                Hesabınız yoxdur?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Qeydiyyat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer /> {/* Footer əlavə edirik */}
    </div>
  );
}
