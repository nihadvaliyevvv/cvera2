'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import StandardHeader from '@/components/ui/StandardHeader';
import Footer from '@/components/Footer';

export default function NewCVPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    templateId: 'professional', // Bazada mövcud olan template
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      summary: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    if (field === 'title' || field === 'templateId') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('CV başlığı tələb olunur');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Giriş tələb olunur');
        setLoading(false);
        return;
      }

      console.log('📤 Göndərilən məlumatlar:', formData);

      const response = await fetch('/api/cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          templateId: formData.templateId,
          cv_data: {
            personalInfo: formData.personalInfo,
            experience: [],
            education: [],
            skills: [],
            languages: []
          }
        })
      });

      const result = await response.json();
      console.log('📥 API cavabı:', result);

      if (!response.ok) {
        setError(result.error || 'CV yaradılmadı');
        return;
      }

      if (result.success && result.cvId) {
        console.log('✅ Yeni CV yaradıldı:', result.cvId);

        // Redirect to edit the created CV
        router.push(`/cv/edit/${result.cvId}`);
      } else {
        setError(result.error || 'CV yaradılmadı');
      }

    } catch (error) {
      console.error('❌ CV yaratma xətası:', error);
      setError(`CV yaradılanda xəta: ${error instanceof Error ? error.message : 'Naməlum xəta'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <p className="text-gray-600 text-center">Giriş tələb olunur...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StandardHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
            {/* Title Section */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Yeni CV Yarat</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Əsas məlumatları daxil edin və sonra CV-ni tam redaktə edə bilərsiniz
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
              {/* CV Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  CV Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="məsələn: Frontend Developer CV"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                  required
                />
              </div>

              {/* Template Selection */}
              <div>
                <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Seçin
                </label>
                <select
                  id="templateId"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                >
                  <option value="professional">Professional (Pulsuz)</option>
                  <option value="modern">Modern Creative (Orta)</option>
                  <option value="elegant">Elegant Professional (Premium)</option>
                  <option value="executive">Executive Elite (Premium)</option>
                </select>
              </div>

              {/* Personal Info Section */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Şəxsi Məlumatlar</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Adınız"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Soyadınız"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+994 XX XXX XX XX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Ünvan
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={formData.personalInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Şəhər, ölkə"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                    Qısa Məlumat
                  </label>
                  <textarea
                    id="summary"
                    value={formData.personalInfo.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Özünüz haqqında qısa məlumat..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Ləğv et
                </Link>

                <button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium text-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yaradılır...
                    </div>
                  ) : (
                    'CV Yarat və Redaktəyə Başla'
                  )}
                </button>
              </div>
            </form>

            {/* Info Section */}
            <div className="mt-12 bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Növbəti addımlar</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>CV yaradıldıqdan sonra redaktə səhifəsinə yönləndiriləcəksiniz</li>
                <li>İş təcrübəsi, təhsil və bacarıqlarınızı əlavə edə bilərsiniz</li>
                <li>Template-i istədiyiniz zaman dəyişə bilərsiniz</li>
                <li>CV-ni PDF formatında yükləyə bilərsiniz</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
