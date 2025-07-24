'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Landing6Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [beforeAfterPosition, setBeforeAfterPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const beforeAfterRef = useRef<HTMLDivElement>(null);
  const cvModelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
      anchorPlacement: 'top-bottom'
    });
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle before/after slider
  const handleBeforeAfterMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !beforeAfterRef.current) return;
    
    const rect = beforeAfterRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    setBeforeAfterPosition(Math.max(0, Math.min(100, percentage)));
  };

  const features = [
    {
      title: "Süni İntellekt Köməkçisi",
      description: "Təcrübələrinizi peşəkar cümlələrə çevirin",
      visual: "ai-assistant"
    },
    {
      title: "Peşəkar Şablonlar",
      description: "Hər sektora uyğun, recruiter'lər tərəfindən bəyənilən dizaynlar",
      visual: "templates"
    },
    {
      title: "Real-Zamanlı Analitika",
      description: "CV-nizə neçə dəfə baxıldığını izləyin və təkmilləşdirin",
      visual: "analytics"
    }
  ];

  const testimonials = [
    {
      name: "Ayan Məmmədova",
      title: "Marketinq Meneceri",
      quote: "CVERA ilə 1 saatda hazırladığım CV sayəsində 3 fərqli şirkətdən müsahibə təklifi aldım. Möhtəşəmdir!",
      avatar: "👩‍💼"
    },
    {
      name: "Kənan Əliyev",
      title: "Proqram Mühəndisi",
      quote: "Dizaynla aram yoxdur. Buradakı hazır şablonlar həyatımı xilas etdi. Həm peşəkar, həm də gözəldir.",
      avatar: "👨‍💻"
    },
    {
      name: "Leyla Qasımova",
      title: "HR Mütəxəssisi",
      quote: "CVERA-dan istifadə edən namizədlərin CV-ləri həmişə diqqətimizi çəkir. Fərq aydın görünür.",
      avatar: "👩‍🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Light Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-64 h-64 bg-blue-50 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-3/4 left-1/5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight">CVERA</span>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm uppercase tracking-wide">Xüsusiyyətlər</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm uppercase tracking-wide">Rəylər</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm uppercase tracking-wide">Qiymətlər</a>
            </nav>
            
            <Link href="/auth/register" className="hidden md:block bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5">
              Daxil Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Interactive Hero Section */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left" data-aos="fade-right">
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
                <span className="text-blue-700 font-medium text-sm">AI İlə Gücləndirilmiş CV Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black mb-10 leading-tight tracking-tight">
                <span className="text-gray-900">
                  Karyeranızın
                </span>
                <br />
                <span className="text-blue-600">
                  Gələcəyini
                </span>
                <br />
                <span className="text-gray-900">
                  Yaradın
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-xl font-light">
                Dünya standartlarında CV-lər yaradın. Süni intellekt köməyi ilə saniyələr içində peşəkar və seçilən CV hazırlayın.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/register" className="group inline-flex items-center justify-center bg-blue-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 transition-all duration-500 hover:scale-105 hover:-translate-y-1">
                  <span>Pulsuz Başla</span>
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <button className="inline-flex items-center justify-center bg-white text-gray-700 px-10 py-5 rounded-2xl font-semibold text-lg border border-gray-200 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12.414 11.5a1 1 0 00-.707.293L11 12.5" />
                  </svg>
                  Demo İzlə
                </button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex -space-x-2 mr-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-600">A</div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-600">K</div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-blue-600">L</div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">+5K</div>
                </div>
                <span>5,000+ istifadəçi artıq qoşulub</span>
              </div>
            </div>

            {/* 3D CV Model */}
            <div className="relative flex justify-center lg:justify-end" data-aos="fade-left">
              <div ref={cvModelRef} className="relative">
                <div className="w-96 h-[28rem] bg-white border border-gray-100 rounded-3xl p-10 shadow-2xl shadow-gray-500/10 transform perspective-1000 hover:rotate-y-12 transition-transform duration-700 hover:scale-105">
                  {/* CV Content Simulation */}
                  <div className="space-y-8">
                    <div className="flex items-center space-x-5">
                      <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">AK</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-800 rounded-lg w-4/5 mb-3"></div>
                        <div className="h-3 bg-gray-400 rounded w-3/5"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-3 bg-blue-600 rounded-lg w-full"></div>
                      <div className="h-3 bg-blue-500 rounded-lg w-5/6"></div>
                      <div className="h-3 bg-blue-400 rounded-lg w-4/6"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-700 rounded-lg w-full"></div>
                        <div className="h-2 bg-gray-300 rounded w-4/5"></div>
                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-gray-700 rounded-lg w-full"></div>
                        <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                        <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">React</span>
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Node.js</span>
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Python</span>
                    </div>
                  </div>
                  
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-3xl bg-blue-500/5 blur-2xl -z-10"></div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">
              <span className="text-red-600">
                Köhnə CV-lər
              </span>
              <span className="text-gray-900"> Karyeranıza Əngəl Olur</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hər gün minlərlə CV-nin arasında kaybolmayın. Fərqinizi ortaya qoyun.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-10 hover:bg-red-50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-100" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-200 transition-colors">
                <div className="text-3xl">😵‍💫</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Boş Səhifə Sindromu</h3>
              <p className="text-gray-600 leading-relaxed">Nədən başlayacağınızı bilmirsiniz və saatlərcə boş səhifəyə baxırsınız.</p>
            </div>

            <div className="group bg-white rounded-3xl p-10 hover:bg-red-50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-100" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-200 transition-colors">
                <div className="text-3xl">🚫</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ATS Robotlarından Keçmir</h3>
              <p className="text-gray-600 leading-relaxed">CV-niz avtomatik sistemlər tərəfindən kənarlaşdırılır və HR-a çatmır.</p>
            </div>

            <div className="group bg-white rounded-3xl p-10 hover:bg-red-50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-100" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-200 transition-colors">
                <div className="text-3xl">🎨</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dizayn Zövqsüz Görünür</h3>
              <p className="text-gray-600 leading-relaxed">Peşəkar təəssürat yaratmır və digər namizədlər arasında kaybolur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Sizi Zirvəyə Aparacaq Xüsusiyyətlər</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ən müasir texnologiyalarla donatılmış alətlər sizə kömək edir
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Feature Tabs */}
            <div className="space-y-6" data-aos="fade-right">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-3xl cursor-pointer transition-all duration-500 border-2 ${
                    currentFeature === index
                      ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/10'
                      : 'bg-white border-gray-100 hover:bg-gray-50 hover:shadow-lg'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      currentFeature === index ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      {index === 0 && (
                        <svg className={`w-6 h-6 ${currentFeature === index ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg className={`w-6 h-6 ${currentFeature === index ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg className={`w-6 h-6 ${currentFeature === index ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Visual */}
            <div className="relative" data-aos="fade-left">
              <div className="bg-white border border-gray-100 rounded-3xl p-12 h-[500px] flex items-center justify-center shadow-xl">
                {currentFeature === 0 && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="text-gray-900 text-2xl font-bold mb-4">AI Köməkçi İşləyir...</div>
                    <div className="space-y-3 max-w-sm mx-auto">
                      <div className="h-4 bg-blue-600 rounded-lg w-full animate-pulse"></div>
                      <div className="h-4 bg-blue-500 rounded-lg w-3/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-4 bg-blue-400 rounded-lg w-5/6 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                )}
                {currentFeature === 1 && (
                  <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                    <div className="bg-blue-600 rounded-2xl p-6 h-40 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">Modern</span>
                    </div>
                    <div className="bg-blue-500 rounded-2xl p-6 h-40 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">Klassik</span>
                    </div>
                    <div className="bg-blue-400 rounded-2xl p-6 h-40 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">Yaradıcı</span>
                    </div>
                    <div className="bg-blue-300 rounded-2xl p-6 h-40 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">Minimal</span>
                    </div>
                  </div>
                )}
                {currentFeature === 2 && (
                  <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="text-gray-900 text-2xl font-bold">Real-Zamanlı Statistika</div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                        <span className="text-gray-700 font-medium">Baxış sayı</span>
                        <span className="text-blue-600 font-bold text-xl">127</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                        <span className="text-gray-700 font-medium">Yükləmələr</span>
                        <span className="text-blue-600 font-bold text-xl">23</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
                        <span className="text-gray-700 font-medium">Müsahibələr</span>
                        <span className="text-green-600 font-bold text-xl">5</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-24 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20" data-aos="fade-up">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">İstifadəçilərimiz Nə Deyir?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Minlərlə istifadəçi artıq CVERA ilə xəyallarındakı işi tapdı
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto" data-aos="fade-up">
            <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-gray-100">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-blue-600 font-medium">{testimonials[currentTestimonial].title}</div>
                </div>
              </div>
              
              <blockquote className="text-2xl lg:text-3xl text-gray-700 mb-10 italic leading-relaxed font-light max-w-4xl mx-auto">
                "{testimonials[currentTestimonial].quote}"
              </blockquote>
              
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-10 space-x-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            {/* Background decorations */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-500 rounded-2xl rotate-12 opacity-20"></div>
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-400 rounded-2xl -rotate-12 opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center" data-aos="zoom-in">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 leading-tight tracking-tight">
              Növbəti Karyera
              <br />
              <span className="text-blue-200">
                Addımınızı
              </span>
              <br />
              Bu Gün Atın
            </h2>
            <p className="text-2xl text-blue-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Xəyallarınızdakı işə gedən yolda ən güclü köməkçiniz CVERA olacaq. 
              <br className="hidden lg:block" />
              Risq yoxdur, sadəcə fürsətlər var.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/auth/register" className="group inline-flex items-center justify-center bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 magnetic-button">
                <span>Karyeramı Qurmağa Başlayıram</span>
                <svg className="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <div className="flex items-center text-blue-100">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Kredit kartı tələb olunmur</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center space-x-8 text-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-sm">Aktiv İstifadəçi</div>
              </div>
              <div className="w-1 h-12 bg-blue-400"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm">Müvəffəqiyyət Dərəcəsi</div>
              </div>
              <div className="w-1 h-12 bg-blue-400"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-sm">İstifadəçi Reytinqi</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-y-12:hover {
          transform: rotateY(12deg);
        }
        
        .magnetic-button:hover {
          cursor: pointer;
        }
        
        @media (hover: hover) {
          .magnetic-button {
            transition: transform 0.3s ease;
          }
          
          .magnetic-button:hover {
            transform: translateY(-4px) scale(1.05);
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
