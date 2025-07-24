'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Pulsuz',
    price: 0,
    features: [
      'Gündə 2 CV yaratma limiti',
      'Pulsuz şablonlar (Basic və Resumonk Bold)',
      'Yalnız PDF formatında yükləmə',
      'E-poçt dəstəyi'
    ]
  },
  {
    id: 'medium',
    name: 'Orta',
    price: 2.99,
    features: [
      'Gündə 5 CV yaratma limiti',
      'Pulsuz və Orta səviyyə şablonlar',
      'PDF və DOCX formatında yükləmə',
      'Saytda texniki dəstək',
      'LinkedIn profilindən idxal'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    features: [
      'Limitsiz CV yaratma',
      'Bütün şablonlar (Premium daxil)',
      'PDF və DOCX formatında yükləmə',
      'CV-də şəkil yerləşdirmə imkanı',
      'Prioritet dəstək xidməti',
      'LinkedIn profilindən idxal'
    ]
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('Free');
  const [error, setError] = useState('');

  const loadUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data from API:', userData); // Debug log
        
        // Get active subscription tier, default to 'Free' if no active subscription
        const activeSubscription = userData.subscriptions?.[0];
        const tier = activeSubscription?.tier || 'Free';
        
        console.log('Active subscription:', activeSubscription); // Debug log
        console.log('Setting userTier to:', tier); // Debug log
        
        setUserTier(tier);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }, [router]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    setLoading(planId);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: plan.name,
          amount: plan.price
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      } else {
        setError(data.message || 'Ödəniş yaradıla bilmədi');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Ödəniş zamanı xəta baş verdi');
    } finally {
      setLoading(null);
    }
  };

  const getTierLevel = (tier: string) => {
    const levels = { 
      Free: 0, Medium: 1, Premium: 2,
      Pulsuz: 0, Orta: 1  // Azərbaycanca adlar - Premium eyni qalır
    };
    return levels[tier as keyof typeof levels] || 0;
  };

  const getCurrentPlanId = (userTier: string) => {
    const tierToPlanId: { [key: string]: string } = {
      'Free': 'free',
      'Medium': 'medium',
      'Premium': 'premium',
      'Pulsuz': 'free',
      'Orta': 'medium'
    };
    return tierToPlanId[userTier] || 'free';
  };

  const normalizeTierName = (tier: string) => {
    const mapping: { [key: string]: string } = {
      'Free': 'Free',
      'Medium': 'Medium', 
      'Premium': 'Premium',
      'Pulsuz': 'Free',
      'Orta': 'Medium'
    };
    return mapping[tier] || tier;
  };

  const currentTierLevel = getTierLevel(userTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-emerald-400/30 rounded-full animate-ping"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center group">
              <Image 
                src="/cveranazik.png" 
                alt="CVERA Logo" 
                width={48}
                height={48}
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/templates"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <span>📄</span>
                <span>Şablonlar</span>
              </Link>
              <span className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 shadow-sm">
                <span>💎</span>
                <span>Qiymətlər</span>
              </span>
            </nav>

            {/* Back to Dashboard Button */}
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Qiymət Planları
            </h1>
            <p className="text-xl text-gray-600">
              Ehtiyacınıza uyğun planı seçin və karyeranızı irəlilətmə yoluna başlayın
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const planLevel = getTierLevel(plan.name);
            // Plan comparison using plan IDs for accuracy
            const currentPlanId = getCurrentPlanId(userTier);
            const isCurrentPlan = currentPlanId === plan.id;
            const isDowngrade = planLevel < currentTierLevel;
            
            console.log(`Plan: ${plan.name} (${plan.id}), Level: ${planLevel}, Current: ${currentTierLevel}, UserTier: ${userTier}, CurrentPlanId: ${currentPlanId}, IsCurrentPlan: ${isCurrentPlan}, IsDowngrade: ${isDowngrade}`); // Debug log
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Populyar Seçim
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.id === 'premium' ? 'bg-gradient-to-br from-yellow-100 to-orange-100' :
                      plan.id === 'medium' ? 'bg-gradient-to-br from-blue-100 to-purple-100' :
                      'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      {plan.id === 'premium' ? (
                        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : plan.id === 'medium' ? (
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price === 0 ? 'Pulsuz' : `${plan.price} AZN`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-600 ml-2 text-lg">/aylıq</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm leading-6">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan || isDowngrade}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                      isCurrentPlan
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : isDowngrade
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                        : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Yüklənir...
                      </div>
                    ) : isCurrentPlan ? (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Hazırki Plan
                      </div>
                    ) : isDowngrade ? (
                      'Aşağı Səviyyə'
                    ) : plan.price === 0 ? (
                      'Pulsuz Başla'
                    ) : (
                      currentPlanId === 'free' ? 'Premium-a Yüksəl' : 'Planı Dəyişin'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Sualınız var?</h3>
          <p className="text-gray-600 mb-6">
            Bizim komandamız sizə kömək etməyə hazırdır. İstənilən sual və ya problemlə bağlı bizimlə əlaqə saxlayın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@cvera.az" 
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>E-poçt göndər</span>
            </a>
            <a 
              href="tel:+994501234567" 
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Zəng et</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
