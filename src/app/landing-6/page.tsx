'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing6() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white cursor-none">
      {/* Custom Cursor */}
      <div
        className="fixed top-0 left-0 w-6 h-6 bg-blue-400 rounded-full pointer-events-none z-50 mix-blend-screen transition-transform duration-75 ease-out"
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
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50"></div>
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-40 w-3 h-3 bg-indigo-300 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-60 right-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-50" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 right-60 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-dark" width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#60A5FA" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid-dark)" />
            </svg>
          </div>
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
              <span className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full text-sm tracking-wide shadow-2xl border border-blue-400/30 backdrop-blur-sm">
                ⚡ CVERA - Premium CV Yaratmaq Platforması
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              variants={itemVariants}
              className="mb-12"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black mb-8 leading-tight">
                <span className="block mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                    AI İlə CV
                  </span>
                </span>
                <span className="block text-white">
                  Yaratmaq
                </span>
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl text-blue-100 max-w-6xl mx-auto leading-relaxed px-4 font-light">
                LinkedIn məlumatlarınızı daxil edin və <span className="font-bold text-cyan-300">süni intellekt</span> ilə
                professional <span className="font-bold text-blue-300">resume yarat</span> - sadəcə 3 dəqiqədə!
              </p>
            </motion.div>

            {/* Interactive Feature Cards */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="400"
              className="grid md:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto"
            >
              <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">⚡ Sürətli</h3>
                <p className="text-blue-200 text-sm leading-relaxed">3 dəqiqədə hazır professional CV</p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">🤖 AI Güclü</h3>
                <p className="text-blue-200 text-sm leading-relaxed">Ağıllı məzmun və optimizasiya</p>
              </div>

              <div className="group bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">💎 Premium</h3>
                <p className="text-blue-200 text-sm leading-relaxed">Ekskluziv professional şablonlar</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="600"
              className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20"
            >
              <Link href="/auth/register">
                <button className="group relative w-full sm:w-auto px-16 py-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white font-bold text-2xl rounded-2xl shadow-2xl overflow-hidden transform hover:scale-110 transition-all duration-500 border border-blue-400/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
                  <span className="relative flex items-center justify-center gap-4">
                    🚀 CV Yaratmağa Başla
                    <svg className="w-7 h-7 group-hover:translate-x-3 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              </Link>

              <Link href="/templates">
                <button className="group w-full sm:w-auto px-16 py-6 bg-white/10 backdrop-blur-md text-white font-bold text-2xl rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-110 transition-all duration-500 shadow-xl">
                  <span className="flex items-center justify-center gap-4">
                    📋 Şablonları Keşfet
                    <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Advanced Trust Indicators */}
            <motion.div
              variants={itemVariants}
              data-aos="fade-up"
              data-aos-delay="800"
              className="flex flex-wrap justify-center items-center gap-8 text-blue-200"
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-xl">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">500+ Aktiv İstifadəçi</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-xl">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Bank Səviyyəsi Təhlükəsizlik</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-xl">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Ən Güclü AI Texnologiya</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-blue-900 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-8">
              Azerbaycanca CV <span className="text-cyan-400">Hazırlama Prosesi</span>
            </h2>
            <p className="text-2xl text-blue-200 max-w-4xl mx-auto leading-relaxed">
              CV yazmaq proqramı ilə professional nəticə əldə etmək üçün sadə addımlar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 opacity-30"></div>

            {/* Step 1 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="200">
              <div className="relative mb-10">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 border-4 border-blue-400/30">
                  <span className="text-4xl font-black text-white">1</span>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">LinkedIn Profili</h3>
              <p className="text-blue-200 text-lg leading-relaxed max-w-sm mx-auto">
                LinkedIn profil linkinizi daxil edin. Biz məlumatlarınızı avtomatik toplayacağıq və strukturlaşdıracağıq.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="400">
              <div className="relative mb-10">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 border-4 border-purple-400/30">
                  <span className="text-4xl font-black text-white">2</span>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-lg">🤖</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">AI Optimallaşdırma</h3>
              <p className="text-blue-200 text-lg leading-relaxed max-w-sm mx-auto">
                Süni intellekt məlumatlarınızı analiz edərək ən effektiv və professional CV məzmunu yaradır.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group" data-aos="fade-up" data-aos-delay="600">
              <div className="relative mb-10">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 border-4 border-emerald-400/30">
                  <span className="text-4xl font-black text-white">3</span>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                  <span className="text-lg">✅</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">CV Hazır!</h3>
              <p className="text-blue-200 text-lg leading-relaxed max-w-sm mx-auto">
                Professional dizaynda PDF formatında CV-nizi yükləyin və iş axtarışına başlayın!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Powerful CTA */}
      <section className="py-32 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-ping"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div data-aos="fade-up" className="max-w-6xl mx-auto">
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-12 leading-tight">
              Online CV Yaratmaq <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Gələcəyiniz Başlayır!
              </span>
            </h2>
            <p className="text-2xl sm:text-3xl text-blue-100 mb-16 leading-relaxed font-light">
              Dünya standartlarında professional CV ilə karyeranızı <br />
              <span className="font-bold text-cyan-300">növbəti səviyyəyə</span> çıxarın
            </p>

            <Link href="/auth/register">
              <button className="group inline-flex items-center px-20 py-8 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-black text-3xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-6 hover:scale-110 transition-all duration-700 border-4 border-cyan-300/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-1000"></div>
                <span className="relative flex items-center gap-6">
                  <span className="text-4xl animate-bounce">🚀</span>
                  CVERA İlə İndi Başla - Pulsuz
                  <svg className="w-10 h-10 group-hover:translate-x-4 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </Link>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-8 text-blue-200">
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black mb-3 text-cyan-400 group-hover:text-yellow-300 transition-colors">2</div>
                <div className="text-base font-semibold">Dəqiqədə Orta Hesabla</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black mb-3 text-emerald-400 group-hover:text-yellow-300 transition-colors">20+</div>
                <div className="text-base font-semibold">Premium Şablon</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black mb-3 text-purple-400 group-hover:text-yellow-300 transition-colors">AI</div>
                <div className="text-base font-semibold">Ən Güclü Texnologiya</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black mb-3 text-pink-400 group-hover:text-yellow-300 transition-colors">0₼</div>
                <div className="text-base font-semibold">Başlanğıc Qiymət</div>
              </div>
              <div className="text-center group hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-black mb-3 text-blue-400 group-hover:text-yellow-300 transition-colors">∞</div>
                <div className="text-base font-semibold">İmkanlar</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
