'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Professional cursor effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateMousePosition = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, []);

  return (
    <div className="bg-white">
      {/* Professional Cursor */}
      <div 
        className="fixed w-4 h-4 rounded-full bg-blue-500/30 pointer-events-none z-50 transition-all duration-200 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
        }}
      />
      <div 
        className="fixed w-1 h-1 rounded-full bg-blue-600 pointer-events-none z-50"
        style={{
          left: mousePosition.x - 2,
          top: mousePosition.y - 2,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                CVera
              </span>
            </motion.div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/auth/login"
                className="hidden sm:block px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Giriş
              </Link>
              <Link 
                href="/auth/register"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base"
              >
                Qeydiyyat
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - UWork Style Split Layout */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Creative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),rgba(255,255,255,0))]"></div>
          
          {/* Floating 3D Elements */}
          {typeof window !== 'undefined' && [...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                rotate: Math.random() * 360
              }}
              animate={{ 
                y: [null, Math.random() * window.innerHeight],
                rotate: [null, Math.random() * 360 + 180],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ 
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {i % 3 === 0 && (
                <div className="w-8 h-8 bg-blue-200 rounded-lg transform rotate-45"></div>
              )}
              {i % 3 === 1 && (
                <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
              )}
              {i % 3 === 2 && (
                <div className="w-4 h-12 bg-blue-250 rounded-full transform rotate-45"></div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6">
          {/* Left Side - Content */}
          <motion.div 
            className="text-left"
            style={{ y, opacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Professional CV Builder
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900"
            >
              Peşəkar CV-nizi
              <br />
              <span className="text-blue-600 relative">
                Asanlıqla Yaradın
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200" viewBox="0 0 400 12" fill="currentColor">
                  <path d="M0 8c40-4 80-4 120 0s80 4 120 0 80-4 120 0 40 4 40 0v4H0z"/>
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg"
            >
              Süni intellekt və modern şablonlar ilə karyeranızı yeni zirvələrə çatdıran CV yaradın
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link 
                href="/auth/register"
                className="group relative px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10">CV Yaratmağa Başla</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo İzlə
                </span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex items-center space-x-8 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">👤</span>
                    </div>
                  ))}
                </div>
                <span>10K+ istifadəçi</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">⭐</span>
                <span>4.9/5 reytinq</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Creative CV Builder Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main CV Document */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 transform rotate-3 hover:rotate-1 transition-transform duration-500">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  {/* Content Sections */}
                  <div className="space-y-3">
                    <div className="h-2 bg-blue-100 rounded-full"></div>
                    <div className="h-2 bg-blue-50 rounded-full w-4/5"></div>
                    <div className="h-2 bg-blue-50 rounded-full w-3/5"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full"></div>
                    <div className="h-2 bg-gray-50 rounded-full w-5/6"></div>
                    <div className="h-2 bg-gray-50 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Floating AI Assistant */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">AI Yardımçı</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </motion.div>

              {/* Templates Floating */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -left-8 top-1/2 transform -translate-y-1/2"
              >
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-600 mb-2">Şablonlar</div>
                  <div className="space-y-1">
                    <div className="w-12 h-2 bg-blue-200 rounded"></div>
                    <div className="w-8 h-2 bg-gray-200 rounded"></div>
                    <div className="w-10 h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </motion.div>

              {/* Export Options */}
              <motion.div
                animate={{ rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">PDF</div>
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">DOCX</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Creative Version */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-50 rounded-full opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Addım-addım təlimat
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Necə İşləyir?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              3 sadə addımda professional CV-nizi hazırlayın
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 transform -translate-y-1/2 z-0"></div>
            
            {[
              {
                step: "01",
                title: "Şablon Seçin",
                description: "Professional şablonlardan birini seçin və özəlləşdirin",
                icon: "📝"
              },
              {
                step: "02", 
                title: "Məlumatları Əlavə Edin",
                description: "Məlumatlarınızı daxil edin və ya LinkedIn-dən idxal edin",
                icon: "✍️"
              },
              {
                step: "03",
                title: "İxrac Edin",
                description: "PDF, DOCX formatında yüksək keyfiyyətli CV-nizi endirin",
                icon: "📄"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group z-10"
              >
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-fit">
                    {/* Animated background circle */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-24 h-24 border-2 border-dashed border-blue-200 rounded-full"
                    ></motion.div>
                    
                    <div className="w-20 h-20 mx-auto bg-white border-4 border-blue-100 rounded-full flex items-center justify-center text-3xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 relative z-10">
                      {item.icon}
                    </div>
                    
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                      {item.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>

                  {/* Interactive illustration */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      {index === 0 && (
                        <div className="space-y-2">
                          <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                          <div className="h-2 bg-blue-100 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-200 rounded-full"></div>
                          <div className="flex-1 space-y-1">
                            <div className="h-2 bg-blue-200 rounded"></div>
                            <div className="h-2 bg-blue-100 rounded w-3/4"></div>
                          </div>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="flex space-x-2 justify-center">
                          <div className="bg-red-200 text-red-700 px-2 py-1 rounded text-xs">PDF</div>
                          <div className="bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs">DOCX</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-16"
          >
            <Link 
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <span>İndi Başlayın</span>
              <motion.svg 
                className="w-5 h-5 ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        {/* Diagonal Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform rotate-12 opacity-30"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-blue-100 to-transparent rounded-full transform -rotate-12 opacity-40"></div>
          
          {/* Diagonal Lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent transform rotate-12"></div>
            <div className="absolute bottom-1/4 right-0 w-full h-0.5 bg-gradient-to-l from-transparent via-blue-100 to-transparent transform -rotate-12"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Güclü Xüsusiyyətlər
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Modern texnologiyalar ilə CV yaratma prosesini optimallaşdırın
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "AI Mətn Yardımçısı",
                description: "Süni intellekt peşəkar mətn təklifləri yaradır",
                icon: "🤖"
              },
              {
                title: "Bacarıq Təklifləri", 
                description: "Sahənizə uyğun bacarıqlar avtomatik təklif edilir",
                icon: "💡"
              },
              {
                title: "Real-zamanlı Önizləmə",
                description: "Dəyişiklikləri dərhal görün və test edin",
                icon: "👁️"
              },
              {
                title: "Professional Şablonlar",
                description: "Müxtəlif sahələr üçün hazırlanmış şablonlar",
                icon: "🎯"
              },
              {
                title: "LinkedIn İnteqrasiyası",
                description: "LinkedIn profilinizdən avtomatik məlumat alın",
                icon: "💼"
              },
              {
                title: "Çoxlu Format Dəstəyi",
                description: "PDF və DOCX formatlarında yüklə",
                icon: "📄"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
        {/* Diagonal Pattern */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
            <defs>
              <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <path d="M0,20 L20,0" stroke="#3b82f6" strokeWidth="0.5" />
                <path d="M0,0 L20,20" stroke="#3b82f6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalPattern)" />
          </svg>
          
          {/* Floating shapes */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-lg transform rotate-45 opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-300 rounded-full opacity-15"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
              Qiymət Planları
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Ehtiyaclarınıza uyğun planı seçin
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Pulsuz",
                price: "₼0",
                period: "/ay",
                features: ["1 CV", "Əsas şablonlar", "PDF ixrac", "Email dəstək"],
                popular: false
              },
              {
                name: "Medium", 
                price: "₼5",
                period: "/ay",
                features: ["5 CV", "Premium şablonlar", "AI xüsusiyyətlər", "DOCX ixrac", "Prioritet dəstək"],
                popular: true
              },
              {
                name: "Premium",
                price: "₼10", 
                period: "/ay",
                features: ["Limitsiz CV", "Bütün şablonlar", "Bütün AI xüsusiyyətlər", "LinkedIn inteqrasiya", "1-1 məsləhət"],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative ${plan.popular ? 'transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Məşhur Seçim
                    </span>
                  </div>
                )}
                
                <div className={`bg-white rounded-xl p-6 sm:p-8 border-2 ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'} hover:shadow-lg transition-all duration-300`}>
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-4xl sm:text-5xl font-bold text-blue-600">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-2 text-sm sm:text-base">
                        {plan.period}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                          ✓
                        </span>
                        <span className="text-gray-600 text-sm sm:text-base">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/auth/register"
                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-center block transition-all duration-300 text-sm sm:text-base ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'border-2 border-gray-300 text-gray-900 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {plan.name === 'Pulsuz' ? 'Pulsuz Başla' : 'Seç'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Transition to CTA */}
      <div className="relative h-32 bg-gray-50 overflow-hidden">
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" 
            fill="#2563eb"
          />
          <path 
            d="M0,20 C300,80 900,80 1200,20 L1200,120 L0,120 Z" 
            fill="#1d4ed8"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.4),rgba(255,255,255,0))]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Karyeranızda İrəli Addım
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 leading-relaxed">
              Bugün CV-nizi yaratmağa başlayın və karyeranızda yeni zirvələrə çatın
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/auth/register"
                className="inline-flex items-center space-x-2 sm:space-x-3 px-8 sm:px-12 py-4 sm:py-6 bg-white text-blue-600 rounded-lg font-bold text-lg sm:text-xl hover:shadow-xl transition-all duration-300"
              >
                <span>CV Yaratmağa Başla</span>
                <span className="text-xl sm:text-2xl">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-white">CVera</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Professional CV builder platforması. Modern texnologiyalar ilə peşəkar CV-lər yaradın.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Məhsul</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Xüsusiyyətlər</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Şablonlar</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Qiymətlər</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Şirkət</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Haqqımızda</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Bloq</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Karyera</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Dəstək</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Yardım Mərkəzi</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Əlaqə</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">API</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2025 CVera. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
