'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import StandardHeader from '@/components/ui/StandardHeader';
import Footer from '@/components/Footer';

interface Template {
  id: string;
  name: string;
  tier: 'Free' | 'Medium' | 'Premium';
  previewUrl: string;
  description?: string;
  hasAccess?: boolean;
  requiresUpgrade?: boolean;
}

interface TemplateApiResponse {
  templates: Template[];
  userTier: string;
  limits: any;
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Authentication kontrolü
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        setIsAuthenticated(true);
        loadTemplates();
      } else {
        // Kullanıcı giriş yapmamış, login sayfasına yönlendir
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/login');
      return;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 600,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
    });
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        setError('Templates yüklənərkən xəta baş verdi');
        return;
      }

      const data: TemplateApiResponse = await response.json();
      setTemplates(data.templates);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Template loading error:', error);
      setError('Templates yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Authentication kontrolü devam ediyorsa loading göster
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı authenticated değilse bu component render edilmeyecek
  // çünkü zaten login sayfasına yönlendirilmiş olacak
  if (!isAuthenticated) {
    return null;
  }

  const categories = [
    { id: 'all', name: 'Hamısı', count: templates.length },
    { id: 'Free', name: 'Pulsuz', count: templates.filter(t => t.tier === 'Free').length },
    { id: 'Medium', name: 'Orta', count: templates.filter(t => t.tier === 'Medium').length },
    { id: 'Premium', name: 'Premium', count: templates.filter(t => t.tier === 'Premium').length },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.tier === selectedCategory);

  const getTemplateFeatures = (template: Template): string[] => {
    const baseFeatures = ['ATS Uyğun', 'Professional Dizayn', 'PDF İxrac'];
    
    if (template.tier === 'Free') {
      return [...baseFeatures, 'Əsas Xüsusiyyətlər'];
    } else if (template.tier === 'Medium') {
      return [...baseFeatures, 'Çox Dilli Dəstək', 'Daha Çox Şablon'];
    } else {
      return [...baseFeatures, 'Premium Dizayn', 'Limitsiz İstifadə', 'Prioritet Dəstək'];
    }
  };

  return (
    <>
      <StandardHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div data-aos="fade-up">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Professional CV{' '}
                <span className="relative inline-block">
                  Şablonları
                  <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 300 20" fill="none">
                    <path d="M5 15c30-10 70-15 140-10s110 10 140 5" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Modern və professional CV şablonları ilə işəgötürənlərin diqqətini çəkin. Hər sahə üçün uyğun dizaynlar.
              </p>
              <div className="flex items-center justify-center">
                <Link href="/pricing" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                  Qiymətlərə Bax
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Template Categories and Filters */}
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4 mb-8" data-aos="fade-up">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">{filteredTemplates.length}</span> şablon tapıldı
              </p>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={loadTemplates}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Yenidən Cəhd Et
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    {/* Template Image */}
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={template.previewUrl}
                        alt={template.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex space-x-2">
                        {template.tier === 'Premium' && (
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Premium
                          </span>
                        )}
                        {template.tier === 'Medium' && (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Orta
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      {hoveredTemplate === template.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="flex space-x-3">
                            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                              Önizləmə
                            </button>
                            <Link
                              href="/auth/register"
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              İstifadə Et
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{template.description || 'Professional CV şablonu'}</p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {getTemplateFeatures(template).map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Link
                        href="/auth/register"
                        className={`w-full block text-center py-3 rounded-lg font-medium transition-all duration-300 ${
                          template.tier === 'Premium'
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700'
                            : template.tier === 'Medium'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {template.tier === 'Premium' ? 'Premium ilə İstifadə Et' :
                         template.tier === 'Medium' ? 'Orta Plan ilə İstifadə Et' :
                         'Pulsuz İstifadə Et'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div data-aos="fade-up">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                CV-nizi Dəqiqələr İçində Hazırlayın
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Professional şablonlarımızı seçin, məlumatlarınızı daxil edin və bir neçə dəqiqə içində mükəmməl CV-yə sahib olun.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link href="/auth/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300">
                  İndi Başlayın
                </Link>
                <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                  Qiymətlərə Bax
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
