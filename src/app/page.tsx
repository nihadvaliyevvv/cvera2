'use client'

import { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out-cubic',
      mirror: true,
      anchorPlacement: 'top-bottom',
      offset: 120,
    })

    // Mouse tracking for cursor effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  // JSON-LD Schema markup for homepage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CVERA",
    "description": "AI ilə professional CV yaratmaq platforması Azerbaycan üçün",
    "url": "https://cvera.net",
    "inLanguage": "az",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cvera.net/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CVERA",
      "url": "https://cvera.net",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cvera.net/logo.png"
      }
    },
    "mainEntity": {
      "@type": "Service",
      "name": "AI ilə CV Yaratmaq",
      "description": "Süni intellekt dəstəyi ilə professional CV yaratmaq xidməti",
      "provider": {
        "@type": "Organization",
        "name": "CVERA"
      },
      "areaServed": "Azerbaijan",
      "availableLanguage": "az"
    }
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white relative">
        {/* Mouse cursor effect */}
        <div
          className="fixed w-6 h-6 bg-blue-500/20 rounded-full pointer-events-none z-50 transition-all duration-200 ease-out"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
            transform: 'scale(1)',
          }}
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
          {/* Geometric Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#2563eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Floating geometric elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-16 w-32 h-32 border-2 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-blue-100 transform rotate-45 animate-bounce"></div>
            <div className="absolute bottom-32 left-32 w-24 h-24 border border-blue-300 transform rotate-12 animate-pulse"></div>
            <div className="absolute top-64 right-40 w-8 h-8 bg-blue-200 rounded-full animate-ping"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center"
            >
              {/* Main Heading */}
              <motion.div
                variants={itemVariants}
                className="mb-12 sm:mb-16"
                data-aos="fade-up"
              >
                <div className="inline-block mb-4 sm:mb-6">
                  <span className="px-4 sm:px-6 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full text-xs sm:text-sm tracking-wide uppercase">
                    Peşəkar Karyera Platforması
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
                  <span className="block text-gray-900 mb-2">AI ilə CV Yaratmaq</span>
                  <span className="block relative inline-block">
                    <span className="absolute inset-0 bg-blue-500 transform -skew-y-2 rounded-lg opacity-100"></span>
                    <span className="relative text-white px-2 py-1 transform -skew-y-2 -translate-y-4">
                      Azerbaycanca Professional Resume Yarat
                    </span>
                  </span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                  Süni intellekt texnologiyası ilə <strong>cv yaratmaq</strong> artıq daha asan və sürətlidir! CVERA platforması ilə <strong>online cv yaratmaq</strong>, professional <strong>resume yarat</strong> və LinkedIn məlumatlarınızı saniyələrdə <strong>azerbaycanca cv</strong>-yə çevirin. <strong>AI ilə CV yaratmaq</strong> xidməti tamamilə pulsuz və istifadəsi asandır.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                data-aos="fade-up"
                data-aos-delay="200"
                className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              >
                <Link
                  href="/auth/register"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">Pulsuz CV Yarat</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/templates"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                >
                  CV Şablonları
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Niyə CVERA-nı Seçməlisiniz?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                <strong>CV yazmaq proqramı</strong> olaraq CVERA, Azerbaycan istifadəçiləri üçün xüsusi hazırlanmış ən müasir <strong>ai ilə cv yaratmaq</strong> platformasıdır.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300" data-aos="fade-up">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Dəstəyi ilə CV Yaratmaq</h3>
                <p className="text-gray-600">
                  Süni intellekt texnologiyası ilə <strong>cv yarat</strong> və professional nəticə əldə et. AI sizin üçün ən uyğun məzmunu yaradır.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="100">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">LinkedIn İnteqrasiyası</h3>
                <p className="text-gray-600">
                  LinkedIn profilinizi birbaşa idxal edin və <strong>azerbaycanca cv</strong> formatına çevirin. Saniyələrdə hazır CV əldə edin.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-300" data-aos="fade-up" data-aos-delay="200">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Şablonlar</h3>
                <p className="text-gray-600">
                  50+ professional CV şablonu arasından seçim edin. Hər sahə üçün xüsusi hazırlanmış dizaynlar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Necə İşləyir?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                3 sadə addımda professional <strong>cv yaz</strong> və karyera yoluna başla
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center" data-aos="fade-up">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Qeydiyyat</h3>
                <p className="text-gray-600">
                  Pulsuz qeydiyyatdan keçin və ya LinkedIn hesabınızla daxil olun
                </p>
              </div>

              <div className="text-center" data-aos="fade-up" data-aos-delay="100">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Məlumatları Daxil Edin</h3>
                <p className="text-gray-600">
                  LinkedIn profilinizi idxal edin və ya manual olaraq məlumatları daxil edin
                </p>
              </div>

              <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">CV-ni Yüklə</h3>
                <p className="text-gray-600">
                  Hazır CV-ni PDF və ya DOCX formatında yükləyin və paylaşın
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              İndi <strong>Online CV Yaratmaq</strong> üçün Başla!
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Minlərlə insan CVERA ilə dream job-larını tapdı. Siz də onlardan biri olun!
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Pulsuz Başla
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}
