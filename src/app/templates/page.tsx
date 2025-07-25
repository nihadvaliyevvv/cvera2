'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AOS from 'aos';
import 'aos/dist/aos.css';

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

  useEffect(() => {
    AOS.init({
      duration: 600,
      offset: 100,
      easing: 'ease-out-cubic',
      once: true,
    });
    
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Templates yüklənərkən xəta baş verdi');
      
      const data: TemplateApiResponse = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Template loading error:', err);
      setError(err instanceof Error ? err.message : 'Şablonlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/landing" className="flex items-center">
              <img 
                src="/cveralogo.svg" 
                alt="CVERA Logo" 
                className="h-40 w-auto mr-2"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/landing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ana Səhifə</Link>
              <span className="text-blue-600 font-bold">Şablonlar</span>
              <Link href="/features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Xüsusiyyətlər</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Qiymətlər</Link>
            </nav>
            
            <Link href="/auth/register" className="hidden lg:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300">
              CV Yarat
            </Link>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-lg text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

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
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Logo and tagline */}
            <div className="lg:col-span-1">
              <div className="mb-6 flex items-center space-x-3">
                <img src="/cveralogo.svg" alt="CVERA Logo" className="w-8 h-8" />
              </div>
              <p className="text-gray-400 mt-2">Professional CV Platform</p>
              
              {/* Social Media */}
              <div className="flex space-x-4 mt-6">
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

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 CVERA. Bütün hüquqlar rezerv edilmişdir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
