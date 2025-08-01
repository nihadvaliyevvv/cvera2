'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Footer əlavə edirik

export default function RegisterPage() {
  // All hooks must be called at the top level, before any early returns
  const { user, register, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // All useEffect hooks must be at the top level
  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Set custom validation messages for Azerbaijani
  useEffect(() => {
    const setCustomValidationMessages = () => {
      const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
      const lastNameInput = document.getElementById('lastName') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;

      if (firstNameInput) {
        firstNameInput.setCustomValidity('');
        firstNameInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
        firstNameInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      if (lastNameInput) {
        lastNameInput.setCustomValidity('');
        lastNameInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else {
            target.setCustomValidity('Zəhmət olmasa bu sahəni düzgün doldurun');
          }
        };
        lastNameInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

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
      }

      if (passwordInput) {
        passwordInput.setCustomValidity('');
        passwordInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else {
            target.setCustomValidity('Zəhmət olmasa şifrə tələblərini yerinə yetirin');
          }
        };
        passwordInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }

      if (confirmPasswordInput) {
        confirmPasswordInput.setCustomValidity('');
        confirmPasswordInput.oninvalid = function(e) {
          const target = e.target as HTMLInputElement;
          if (target.validity.valueMissing) {
            target.setCustomValidity('Zəhmət olmasa bu sahəni doldurun');
          } else {
            target.setCustomValidity('Şifrələr uyğun gəlmir');
          }
        };
        confirmPasswordInput.oninput = function(e) {
          (e.target as HTMLInputElement).setCustomValidity('');
        };
      }
    };

    setCustomValidationMessages();
    const timer = setTimeout(setCustomValidationMessages, 50);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="app-background flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 backdrop-blur-sm border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Don't render register form if user is authenticated
  if (user) {
    return null;
  }

  // Password validation function
  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Şifrə ən azı bir böyük hərf ehtiva etməlidir');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Şifrə ən azı bir kiçik hərf ehtiva etməlidir');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError(passwordValidationErrors.join(', '));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifrələr uyğun gəlmir');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('İstifadə qaydalarını qəbul etməlisiniz');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        // Qeydiyyat uğurlu oldu, indi login et
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();

          // Token-i localStorage-a saxla
          localStorage.setItem('accessToken', loginData.token);

          // Loading state-i bir az uzat və sonra dashboard-a yönləndir
          setTimeout(() => {
            setLoading(false);
            // window.location.href istifadə et ki, tam səhifə yenilənsə
            window.location.href = '/dashboard';
          }, 500);

          return; // handleSubmit-i burada bitir
        } else {
          // Login uğursuz olsa, login səhifəsinə yönləndir
          router.push('/auth/login?message=registered');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Qeydiyyat uğursuz oldu');
      }
    } catch (error) {
      setError('Sistem xətası baş verdi');
    } finally {
      // Yalnız error vəziyyətində loading-i dərhal dayandır
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
      }
    }
  };

  const handleLinkedInRegister = () => {
    // Open LinkedIn logout in a new window to clear session
    const logoutWin = window.open(
      "https://www.linkedin.com/m/logout/",
      "_blank",
      "width=600,height=400"
    );

    // Close the logout window after 3 seconds and redirect to LinkedIn auth
    // Increased from 1.5s to 3s to give more time for logout to complete
    setTimeout(() => {
      logoutWin?.close();
      window.location.href = "/api/auth/linkedin?from=register";
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header currentPage="register" />

      {/* Main Content with Responsive Container */}
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 2xl:px-24 py-8 sm:py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Register Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesab yaradın</h1>
              <p className="text-gray-600">Peşəkar CV yaratmağa başlayın</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

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

              {/* Password Fields */}
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
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                    placeholder="Ən azı 8 simvol"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrəni təkrarla
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                    placeholder="Şifrəni təkrar daxil edin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                  >
                    {showConfirmPassword ? (
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

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  id="agreedToTerms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="agreedToTerms" className="text-sm text-gray-600">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                    İstifadə şərtləri
                  </Link>{' '}
                  və{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                    məxfilik siyasəti
                  </Link>
                  ni qəbul edirəm
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2">Qeydiyyat edilir...</span>
                  </div>
                ) : (
                  'Qeydiyyat'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                Artıq hesabın var?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Daxil ol
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
