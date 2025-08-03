'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StandardHeader from '@/components/ui/StandardHeader';
import Footer from '@/components/Footer';
import { generateStructuredData, organizationData, generateBreadcrumbData } from '@/lib/structured-data';

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
      'Ümumi 2 CV yaratma ',
      'Pulsuz şablonlar (Basic və Resumonk Bold)',
      'Yalnız PDF formatında yükləmə',
      'LinkedIn profilindən idxal',
      'E-poçt dəstəyi'
    ]
  },
  {
    id: 'medium',
    name: 'Orta',
    price: 5, // 2.99 dollara bərabər olan manat qiyməti
    features: [
      'Gündə 5 CV yaratma ',
      'Pulsuz və Orta səviyyə şablonlar',
      'PDF və DOCX formatında yükləmə',
      'Saytda texniki dəstək',
      'LinkedIn profilindən idxal',
      'AI ilə CV təkmilləşdirmə',
      'Professional şablon kolleksiyası',

      'Prioritet dəstək xidməti'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 8, // 4.99 dollara bərabər olan manat qiyməti
    features: [
      'Limitsiz CV yaratma',
      'Bütün şablonlar (Premium daxil)',
      'PDF və DOCX formatında yükləmə',
      'Saytda texniki dəstək',
      'LinkedIn profilindən idxal',
      'AI ilə CV təkmilləşdirmə',
      'Professional şablon kolleksiyası',

      'Prioritet dəstək xidməti'
    ]
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('Free');
  const [error, setError] = useState('');

  // Add structured data for pricing page
  useEffect(() => {
    const addStructuredData = (data: any, type: string, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.innerHTML = generateStructuredData({ type: type as any, data });
      script.id = id;

      // Remove existing script if it exists
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }

      document.head.appendChild(script);
    };

    // Add organization data
    addStructuredData(organizationData, 'Organization', 'structured-data-organization');

    // Add breadcrumb data
    const breadcrumbData = generateBreadcrumbData([
      { name: 'Ana Səhifə', url: 'https://cvera.net' },
      { name: 'Qiymətlər', url: 'https://cvera.net/pricing' }
    ]);
    addStructuredData(breadcrumbData, 'BreadcrumbList', 'structured-data-breadcrumb');

    // Add service offers structured data
    const serviceOffersData = {
      name: "CVERA CV Yaratma Xidmətləri",
      description: "AI əsaslı peşəkar CV yaratma xidmətləri - Pulsuz, Orta və Premium planlar",
      provider: {
        "@type": "Organization",
        name: "CVERA",
        url: "https://cvera.net"
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "CV Yaratma Planları",
        itemListElement: plans.map(plan => ({
          "@type": "Offer",
          name: `${plan.name} Plan`,
          description: `${plan.name} plan - ${plan.features.join(', ')}`,
          price: plan.price.toString(),
          priceCurrency: "AZN",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "CVERA"
          },
          itemOffered: {
            "@type": "Service",
            name: `CV Yaratma - ${plan.name} Plan`,
            description: plan.features.join(', ')
          }
        }))
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "8",
        priceCurrency: "AZN",
        availability: "https://schema.org/InStock",
        offerCount: plans.length.toString()
      }
    };
    addStructuredData(serviceOffersData, 'Service', 'structured-data-pricing-service');

    // Cleanup function
    return () => {
      ['structured-data-organization', 'structured-data-breadcrumb', 'structured-data-pricing-service'].forEach(id => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, []);

  const loadUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
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

      // Plan tipini API-nin gözlədiyi formata çevir
      let apiPlanType = plan.name;
      if (plan.id === 'medium') {
        apiPlanType = 'Medium'; // 'Orta' əvəzinə 'Medium' göndər
      } else if (plan.id === 'premium') {
        apiPlanType = 'Premium'; // Zaten doğru
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType: apiPlanType,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <StandardHeader />

      {/* Main Content with Enhanced Responsive Container - Premium Edge Spacing */}
      <div className="w-full max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Sizə Uyğun <span className="text-blue-600">Planı</span> Seçin
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ehtiyaclarınıza uyğun planı seçin və peşəkar CV yaratmağa başlayın
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-blue-500 ring-4 ring-blue-100' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Ən Populyar
                  </span>
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Pulsuz' : `₼${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/ay</span>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading !== null}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${loading !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading !== null ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      <span className="ml-2">Yüklənir...</span>
                    </div>
                  ) : plan.price === 0 ? (
                    'Başla'
                  ) : (
                    'Seç'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Tez-tez Soruşulan Suallar
          </h2>
          <div className="space-y-6">
            {/* FAQ items would go here */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
