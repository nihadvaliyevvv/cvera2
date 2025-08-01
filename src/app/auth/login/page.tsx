'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Header from '@/components/Header';

export default function LoginPage() {
  // All hooks must be called at the top level, before any early returns
  const { user, loading: authLoading, isInitialized } = useAuth();
  const router = useRouter();

  // All useState hooks must be called in the same order every time
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

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
        
        emailInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.typeMismatch) {
            target.setCustomValidity('Zəhmət olmasa düzgün email ünvanı daxil edin');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
        
        emailInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
        
        emailInput.onfocus = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      if (passwordInput) {
        passwordInput.setCustomValidity('');
        
        passwordInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else if (target.validity.tooShort) {
            target.setCustomValidity('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
          } else if (target.validity.patternMismatch) {
            target.setCustomValidity('Şifrə ən azı bir böyük hərf ehtiva etməlidir');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
        
        passwordInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
        
        passwordInput.onfocus = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      const form = document.querySelector('form');
      if (form) {
        form.addEventListener('submit', function() {
          const inputs = form.querySelectorAll('input[required]');
          inputs.forEach((input: any) => {
            if (!input.value.trim()) {
              input.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
            }
          });
        });
      }
    };

    setCustomValidationMessages();
    const timer = setTimeout(setCustomValidationMessages, 50);
    return () => clearTimeout(timer);
  }, []);

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Hide default cursor
    document.body.style.cursor = 'none';
    // Also hide cursor on all elements
    const style = document.createElement('style');
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      // Restore default cursor
      document.body.style.cursor = 'auto';
      // Remove custom style
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Show loading while checking authentication - but only if not initialized
  if (!isInitialized || authLoading) {
    return (
      <div className="app-background flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

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

  // Show standard loading component during form submission
  if (loading) {
    return (
      <div className="app-background flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        localStorage.setItem('accessToken', data.token);
        router.push('/cv-list');
      } else {
        setError(data.error || 'Giriş zamanı xəta baş verdi');
      }
    } catch (error) {
      setError('Şəbəkə xətası baş verdi');
    } finally {
      setLoading(false);
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
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
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
                  placeholder="example@email.com"
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
                  'Daxil ol'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-4">
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Şifrəni unutmusan?
              </Link>

              <div className="text-sm text-gray-600">
                Hesabın yoxdur?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Qeydiyyat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
