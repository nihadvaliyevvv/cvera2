'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
      anchorPlacement: 'top-bottom'
    });
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission:', formData);
    router.push('/auth/register');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const features = [
    {
      title: "Sürətli Yaradılış",
      description: "LinkedIn profilinizi import edib dəqiqələr içində professional CV hazırlayın."
    },
    {
      title: "Professional Şablonlar", 
      description: "Modern və cəlbedici CV şablonları arasından seçim edin və fərqlənin."
    },
    {
      title: "Çoxlu Format",
      description: "PDF və DOCX formatlarında CV-nizi yüksək keyfiyyətlə ixrac edin."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/cveralogo.svg" 
                alt="CVERA Logo" 
                className="h-12 w-auto mr-2"
              />
              <span className="text-3xl font-bold text-gray-900">CVERA</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <span className="text-blue-600 font-bold">Ana Səhifə</span>
              <Link href="/templates" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Şablonlar</Link>
              <Link href="/features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Xüsusiyyətlər</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Qiymətlər</Link>
            </nav>
            
            <Link href="/auth/register" className="hidden lg:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300">
              CV Yarat
            </Link>
            
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <nav className="px-6 py-6 space-y-4">
              <span className="block text-blue-600 font-bold py-2">Ana Səhifə</span>
              <Link href="/templates" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Şablonlar</Link>
              <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Xüsusiyyətlər</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-medium py-2">Qiymətlər</Link>
              <Link href="/auth/register" className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium mt-4">
                CV Yarat
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div data-aos="fade-right">
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Professional{' '}
                <span className="relative inline-block">
                  CV Hazırlayın
                  <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 300 20" fill="none">
                    <path d="M5 15c30-10 70-15 140-10s110 10 140 5" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                LinkedIn profilinizi avtomatik import edin və professional CV-nizi dəqiqələr içində yaradın.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="/auth/register" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                  <span>Pulsuz Başlayın</span>
                  <div className="ml-3 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right side - Illustration */}
            <div className="relative" data-aos="fade-left">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-12 relative overflow-hidden">
                {/* Professional with tablet illustration */}
                <div className="relative z-10">
                  <div className="bg-white rounded-2xl p-6 shadow-xl transform rotate-3 mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">👨‍💼</span>
                      </div>
                      <div>
                        <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-blue-600 rounded w-full"></div>
                      <div className="h-2 bg-blue-400 rounded w-4/5"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/5"></div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-lg transform -rotate-12 shadow-md"></div>
                  <div className="absolute top-1/2 right-2 w-8 h-8 bg-white rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="mt-20 text-center" data-aos="fade-up">
            <p className="text-gray-500 mb-8 font-medium">Peşəkarlar tərəfindən istifadə olunur</p>
            <div className="flex flex-wrap justify-center items-center space-x-12 opacity-60">
              <div className="text-2xl font-bold text-gray-600">Google</div>
              <div className="text-2xl font-bold text-gray-600">Microsoft</div>
              <div className="text-2xl font-bold text-gray-600">Amazon</div>
              <div className="text-2xl font-bold text-gray-600">SOCAR</div>
              <div className="text-2xl font-bold text-gray-600">Kapital Bank</div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Mükəmməl CV üçün Hər Şey</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Feature snippets */}
            <div data-aos="fade-right">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Sürətli Yaradılış</h3>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Professional Şablonlar</h3>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Çoxlu Format</h3>
                    <div className="flex text-yellow-400">
                      {'★'.repeat(4)}★
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Accordion */}
            <div data-aos="fade-left">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveFeature(activeFeature === index ? -1 : index)}
                      className={`w-full text-left p-6 flex items-center justify-between ${
                        activeFeature === index ? 'bg-blue-50 border-b border-blue-100' : 'bg-white'
                      }`}
                    >
                      <span className={`font-semibold ${activeFeature === index ? 'text-blue-600' : 'text-gray-900'}`}>
                        {feature.title}
                      </span>
                      <svg className={`w-5 h-5 transition-transform ${activeFeature === index ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeFeature === index && (
                      <div className="p-6 pt-0 bg-blue-50">
                        <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">CVERA Xüsusiyyətləri</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real Vaxt Önizləmə</h3>
              <p className="text-gray-600 leading-relaxed">Dəyişikliklərinizi canlı olaraq görün. Nə görürsünüzsə o da alırsınız.</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 relative" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Ən Məşhur
              </div>
              <div className="w-16 h-16 bg-blue-200 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Şablonlar</h3>
              <p className="text-gray-600 leading-relaxed">Sizi işə götürmək üçün hazırlanmış ekskluziv, modern şablonlara tam giriş.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">PDF və Docx Yükləmə</h3>
              <p className="text-gray-600 leading-relaxed">Hazır CV-nizi bir kliklə PDF və Word formatlarında, çoxlu formatlarda yükləyin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Niyə CVERA Seçməlisiniz?</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Benefits list */}
            <div data-aos="fade-right">
              <div className="space-y-6">
                {[
                  "Daha çox müsahibə dəvəti alın",
                  "Digərlərindən fərqlənin", 
                  "Saatlarla vaxt və səy qənaət edin",
                  "Müraciətinizdə özünüzə güvənin",
                  "Professional və mütəşəkkil görünün"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Laptop illustration */}
            <div className="relative" data-aos="fade-left">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-8">
                <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl">
                  {/* Laptop screen */}
                  <div className="bg-white rounded-lg p-6 aspect-video">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-blue-600 rounded w-full"></div>
                        <div className="h-3 bg-blue-400 rounded w-5/6"></div>
                        <div className="h-3 bg-blue-200 rounded w-4/6"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-300 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-300 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Laptop base */}
                  <div className="h-4 bg-gray-700 rounded-b-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Plan Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Sizə Uyğun Paket Seçin</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pulsuz</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">0₼<span className="text-lg font-normal text-gray-500">/ay</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">1 CV</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Əsas Şablonlar</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">CVERA Brendinqi</span>
                </li>
              </ul>
              <Link href="/auth/register" className="w-full block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                Başlayın
              </Link>
            </div>

            {/* Pro Plan - Most Popular */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 relative" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Ən Məşhur
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">15₼<span className="text-lg font-normal text-gray-500">/ay</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Limitsiz CV</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Bütün Premium Şablonlar</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">LinkedIn İnteqrasiyası</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Brendinqsiz</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">PDF və Docx İxrac</span>
                </li>
              </ul>
              <Link href="/auth/register" className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                Başlayın
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200" data-aos="fade-up" data-aos-delay="300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Biznes</h3>
              <div className="text-4xl font-bold text-gray-900 mb-6">30₼<span className="text-lg font-normal text-gray-500">/ay</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Pro-dakı Hər Şey</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Komanda Əməkdaşlığı</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Prioritet Dəstək</span>
                </li>
              </ul>
              <Link href="/contact" className="w-full block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                Əlaqə Saxlayın
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Sign Up Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Testimonial */}
            <div data-aos="fade-right">
              <h2 className="text-4xl font-bold text-white mb-8">İnsanlar CVERA Haqqında Nə Deyir</h2>
              <blockquote className="text-xl text-gray-300 leading-relaxed mb-8">
                "CV-im ilə həftələrlə mübarizə apardım. CVERA ilə bir saatdan az müddətdə professional CV yaratdım və növbəti həftə üç müsahibə dəvəti aldım. Tam oyun dəyişdirici!"
              </blockquote>
              
              {/* User avatars */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-sm">👩</span>
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-sm">👨</span>
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-sm">👩</span>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center relative z-10">
                    <span className="text-white">👨</span>
                  </div>
                  <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-sm">👩</span>
                  </div>
                </div>
                <span className="text-gray-400 ml-4">+2.000 məmnun müştəri</span>
              </div>
            </div>

            {/* Right side - Sign up form */}
            <div className="bg-white rounded-2xl p-8" data-aos="fade-left">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Səyahətinizə Başlayın</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <input 
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ad Soyad"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Ünvan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Şifrə"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Pulsuz Hesab Yaradın
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Logo and tagline */}
            <div className="lg:col-span-1">
              <div className="mb-6 flex items-center space-x-3">
                <img src="/cveralogo.svg" alt="CVERA Logo" className="w-8 h-8" />
                <span className="text-3xl font-bold">CVERA</span>
              </div>
              <p className="text-gray-400 mt-2">Professional CV Platform</p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Şirkət</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-blue-400 transition-colors">Haqqımızda</Link></li>
                <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Karyera</Link></li>
                <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Bloq</Link></li>
              </ul>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Məhsul</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-blue-400 transition-colors">Xüsusiyyətlər</Link></li>
                <li><Link href="/templates" className="hover:text-blue-400 transition-colors">Şablonlar</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Qiymətlər</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Dəstək</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Əlaqə</Link></li>
                <li><Link href="/help" className="hover:text-blue-400 transition-colors">Yardım Mərkəzi</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">İstifadə Şərtləri</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
