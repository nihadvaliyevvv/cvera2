'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        // Qeydiyyatdan sonra avtomatik giriş və dashboard-a yönləndirmə
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
          router.push('/dashboard');
        } else {
          router.push('/auth/login?message=registered');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Qeydiyyat uğursuz oldu');
      }
    } catch (error) {
      setError('Sistem xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInRegister = () => {
    window.location.href = '/api/auth/linkedin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Background Diagonal Pattern - like login page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Diagonal lines pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <pattern id="diagonal-lines-register" patternUnits="userSpaceOnUse" width="100" height="100">
              <path d="M 0,100 l 100,-100 M -25,25 l 50,-50 M 75,125 l 50,-50" stroke="rgb(59, 130, 246)" strokeWidth="1" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines-register)"/>
        </svg>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-blue-100 rounded-full opacity-10 transform rotate-45"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-blue-50 rounded-full opacity-15 transform -rotate-12"></div>
      </div>
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden z-10">
        {/* Diagonal overlay pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="overlay-diagonal-register" patternUnits="userSpaceOnUse" width="50" height="50">
              <path d="M 0,50 l 50,-50 M -12.5,12.5 l 25,-25 M 37.5,62.5 l 25,-25" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#overlay-diagonal-register)"/>
        </svg>
        
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md text-center">
            <div className="w-96 h-96 mx-auto mb-8 relative">
              {/* Professional Character Illustration with enhanced shadows */}
              <div className="w-full h-full bg-blue-300 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-64 bg-amber-100 rounded-t-full shadow-lg">
                  {/* Face */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-20 h-24 bg-amber-200 rounded-full">
                    {/* Hair */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-amber-800 rounded-full"></div>
                    {/* Eyes */}
                    <div className="absolute top-6 left-3 w-2 h-3 bg-gray-800 rounded-full"></div>
                    <div className="absolute top-6 right-3 w-2 h-3 bg-gray-800 rounded-full"></div>
                    {/* Smile */}
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-2 border-gray-800 rounded-full"></div>
                  </div>
                  {/* Body */}
                  <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-32 h-40 bg-gray-700 rounded-t-3xl">
                    {/* Arms */}
                    <div className="absolute top-4 -left-8 w-16 h-6 bg-amber-200 rounded-full transform -rotate-12"></div>
                    <div className="absolute top-4 -right-8 w-16 h-6 bg-amber-200 rounded-full transform rotate-12">
                      {/* Hand with welcome gesture */}
                      <div className="absolute -bottom-2 right-2 w-6 h-4 bg-amber-200 rounded transform rotate-12"></div>
                    </div>
                  </div>
                </div>
                {/* Welcome elements for registration */}
                <div className="absolute top-16 left-12 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                {/* CV Template */}
                <div className="absolute bottom-20 right-8 w-16 h-20 bg-white rounded transform rotate-12 shadow-lg">
                  <div className="w-full h-2 bg-blue-300 rounded-t mt-2"></div>
                  <div className="w-4/5 h-1 bg-gray-200 rounded mx-auto mt-1"></div>
                  <div className="w-3/5 h-1 bg-gray-200 rounded mx-auto mt-1"></div>
                  <div className="w-4/5 h-1 bg-gray-200 rounded mx-auto mt-1"></div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-12 right-8 w-8 h-8 bg-white/30 rounded-full"></div>
                <div className="absolute top-32 left-8 w-6 h-6 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-32 left-16 w-4 h-4 bg-white/25 rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Xoş gəlmisiniz!
            </h1>
            <p className="text-xl text-blue-100 max-w-md leading-relaxed drop-shadow-sm">
              Hesab yaradın və professional CV-nizi hazırlamağa başlayın
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-white rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100 backdrop-blur-sm bg-white/95">
          {/* Logo */}
          <div className="text-center lg:text-left">
            <Link href="/landing" className="inline-flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">CVera</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Qeydiyyatdan keç
            </h2>
            <p className="text-gray-600">Hesab yaradın və CV yaratmağa başlayın</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

              <div className="space-y-5">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-gray-400"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-gray-400"
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-gray-400"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifrə
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-gray-400"
                    placeholder="Şifrənizi daxil edin"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:border-gray-400"
                    placeholder="Şifrəni təkrar daxil edin"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700">İstifadə qaydaları</Link> və{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700">məxfilik siyasəti</Link> ilə razıyam
                </label>
              </div>
            </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Qeydiyyat edilir...</span>
                  </div>
                ) : (
                  'Hesab yarat'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">və ya</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLinkedInRegister}
                className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md group"
              >
                <svg className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 font-semibold">LinkedIn ilə qeydiyyat</span>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Artıq hesabın var?{' '}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline decoration-2 underline-offset-2">
                    Daxil ol
                  </Link>
                </p>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}
