'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing5() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out-cubic',
      mirror: true,
      anchorPlacement: 'top-bottom',
      offset: 120,
    });

    // Mouse tracking for cursor effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 cursor-none">
      {/* Custom Cursor */}
      <div
        className="fixed top-0 left-0 w-6 h-6 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-multiply transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px)`,
        }}
      />
      <div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-blue-300 rounded-full pointer-events-none z-50 transition-transform duration-150 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 24}px, ${mousePosition.y - 24}px)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              className="inline-block mb-8"
            >
              <span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full text-sm tracking-wide shadow-lg">
                🚀 AI CV Yaratmaq Platforması
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              variants={itemVariants}
              className="mb-12"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight">
                <span className="block text-gray-900 mb-4">CV Yaratmaq</span>
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    İndi Daha Asan
                  </span>
                </span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-5xl mx-auto leading-relaxed px-4">
                LinkedIn məlumatlarınızı daxil edin, AI ilə cv yarat və <span className="font-semibold text-blue-600">3 dəqiqədə</span> professional resume yarat
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="400"
              className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sürətli Yaratma</h3>
                <p className="text-sm text-gray-600">3 dəqiqədə hazır</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI Dəstəyi</h3>
                <p className="text-sm text-gray-600">Ağıllı məzmun</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Premium Design</h3>
                <p className="text-sm text-gray-600">Professional şablonlar</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="600"
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link href="/auth/register">
                <button className="group relative w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    🚀 CV Yaratmağa Başla
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </Link>

              <Link href="/templates">
                <button className="group w-full sm:w-auto px-12 py-5 bg-white/90 backdrop-blur-sm text-gray-700 font-bold text-xl rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transform hover:-translate-y-3 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <span className="flex items-center justify-center gap-3">
                    📋 Şablonları Gör
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="800"
              className="flex flex-wrap justify-center items-center gap-6 text-gray-600"
            >
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">200+ İstifadəçi</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">100% Təhlükəsiz</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">AI Güclü</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Necə <span className="text-blue-600">İşləyir?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sadəcə 3 addımda professional azerbaycanca cv hazırlayın
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="200">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">LinkedIn Linki</h3>
              <p className="text-gray-600 leading-relaxed">
                LinkedIn profil linkinizi daxil edin və biz məlumatlarınızı avtomatik olaraq çəkərik
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="400">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI İşləyir</h3>
              <p className="text-gray-600 leading-relaxed">
                Süni intellekt məlumatlarınızı analiz edərək ən yaxşı CV məzmununu yaradır
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="600">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-800" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">CV Hazır!</h3>
              <p className="text-gray-600 leading-relaxed">
                CV yazmaq proqramı işini bitirəndə PDF formatında professional CV-nizi yükləyin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div data-aos="fade-up" className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              Online CV Yaratmaq <br />
              <span className="text-yellow-300">İndi Başlayın!</span>
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 leading-relaxed">
              Dünya standartlarında CV ilə karyeranızı üstünlük qazandırın
            </p>

            <Link href="/auth/register">
              <button className="inline-flex items-center px-16 py-6 bg-white text-blue-600 font-bold text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 hover:scale-110 transition-all duration-500">
                <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                CVERA İlə Başla - Pulsuz
              </button>
            </Link>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">3</div>
                <div className="text-sm">Dəqiqədə Hazır</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-sm">Premium Şablon</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">AI</div>
                <div className="text-sm">Güclü Dəstək</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">0₼</div>
                <div className="text-sm">Başlanğıc Qiymət</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
