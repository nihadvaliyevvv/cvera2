'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

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
    name: 'Free',
    price: 0,
    features: [
      'Əsas şablonlar',
      'PDF formatında yükləmə',
      'E-poçt dəstəyi',
      '1 CV yaratma'
    ]
  },
  {
    id: 'medium',
    name: 'Medium',
    price: 0.02,
    features: [
      'Bütün əsas funksiyalar',
      'Premium şablonlar',
      'PDF və DOCX formatında yükləmə',
      'LinkedIn profilindən idxal',
      'Prioritet dəstək',
      '5 CV yaratma'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4.97,
    features: [
      'Bütün Medium funksiyalar',
      'Ən eksklüziv şablonlar',
      'CV-də brending və ya logo',
      'A4 ölçüsündə ideal formatlaşdırma',
      'Limitsiz CV yaratma',
      'VIP dəstək xidməti'
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
    const levels = { Free: 0, Medium: 1, Premium: 2 };
    return levels[tier as keyof typeof levels] || 0;
  };

  const currentTierLevel = getTierLevel(userTier);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Qiymət Planları
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Ehtiyacınıza uyğun planı seçin
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const planLevel = getTierLevel(plan.name);
            const isCurrentPlan = userTier === plan.name;
            const isDowngrade = planLevel < currentTierLevel;
            
            console.log(`Plan: ${plan.name}, Level: ${planLevel}, Current: ${currentTierLevel}, IsCurrentPlan: ${isCurrentPlan}, IsDowngrade: ${isDowngrade}`); // Debug log
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-md overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                    Populyar
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Pulsuz' : `${plan.price} AZN`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/ay</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id || isCurrentPlan || isDowngrade}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : isDowngrade
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Yüklənir...
                      </div>
                    ) : isCurrentPlan ? (
                      'Hazırki Plan'
                    ) : isDowngrade ? (
                      'Aşağı Səviyyə'
                    ) : plan.price === 0 ? (
                      'Pulsuz Başla'
                    ) : (
                      userTier === 'Pulsuz' ? 'Yüksəldin' : 'Planı Dəyişin'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Sualınız var? 
            <a href="mailto:support@cvera.az" className="text-blue-600 hover:underline ml-1">
              Bizə yazın
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
