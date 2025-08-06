'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface PromoCodeSectionProps {
  userTier: string;
  onTierUpdate: () => void;
}

export default function PromoCodeSection({ userTier, onTierUpdate }: PromoCodeSectionProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoValidation, setPromoValidation] = useState<any>(null);

  // Helper function to get tier level for comparison
  const getTierLevel = (tier: string) => {
    const levels = {
      'Free': 0, 'Medium': 1, 'Premium': 2, 'Pro': 2,
      'Pulsuz': 0, 'Orta': 1  // Azərbaycanca adlar
    };
    return levels[tier as keyof typeof levels] || 0;
  };

  // Helper function to check if user can use a promo code
  const canUsePromoTier = (promoTier: string) => {
    const currentLevel = getTierLevel(userTier);
    const promoLevel = getTierLevel(promoTier);
    return promoLevel > currentLevel;
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/promo-code/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promoCode: promoCode.trim() })
      });

      const data = await response.json();

      // Additional validation for tier level
      if (data.valid && data.tier) {
        if (!canUsePromoTier(data.tier)) {
          setPromoValidation({
            valid: false,
            message: `${data.tier} promokodu istifadə edə bilməzsiniz. Siz artıq ${userTier} və ya daha yüksək paketdəsiniz.`
          });
          return;
        }
      }

      setPromoValidation(data);
    } catch (error) {
      setPromoValidation({
        valid: false,
        message: 'Promokod yoxlanılarkən xəta baş verdi'
      });
    }
  };

  const applyPromoCode = async () => {
    if (!user) {
      setPromoMessage('Promokod istifadə etmək üçün giriş etməlisiniz');
      return;
    }

    if (!promoCode.trim()) {
      setPromoMessage('Promokod daxil edin');
      return;
    }

    setPromoLoading(true);
    setPromoMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/promo-code/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promoCode: promoCode.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setPromoMessage(data.message);
        setPromoCode('');
        setPromoValidation(null);
        // Update the tier in parent component
        onTierUpdate();
        // Redirect to dashboard after successful application
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setPromoMessage(data.message || 'Promokod tətbiq edilərkən xəta baş verdi');
      }
    } catch (error) {
      setPromoMessage('Promokod tətbiq edilərkən xəta baş verdi');
    } finally {
      setPromoLoading(false);
    }
  };

  // Show current tier information
  const getCurrentTierDisplay = () => {
    const tierDisplayNames = {
      'Free': 'Pulsuz',
      'Medium': 'Orta',
      'Premium': 'Premium',
      'Pro': 'Pro'
    };
    return tierDisplayNames[userTier as keyof typeof tierDisplayNames] || userTier;
  };

  return (
    <div className="space-y-4">
      {/* Current tier display */}
      <div className="bg-blue-50 p-3 rounded-lg text-center">
        <p className="text-blue-800 text-sm">
          <span className="font-medium">Cari paketiniz:</span> {getCurrentTierDisplay()}
        </p>
        {userTier !== 'Free' && (
          <p className="text-blue-600 text-xs mt-1">
            Yalnız daha yüksək paketlər üçün promokod istifadə edə bilərsiniz
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value.toUpperCase());
            validatePromoCode();
          }}
          placeholder="Promokod daxil edin"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg"
          disabled={promoLoading}
        />
        <button
          onClick={applyPromoCode}
          disabled={promoLoading || !promoCode.trim() || !user || (promoValidation && !promoValidation.valid)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {promoLoading ? 'Tətbiq edilir...' : 'Tətbiq et'}
        </button>
      </div>

      {!user && (
        <div className="text-center">
          <p className="text-orange-600 text-sm">
            Promokod istifadə etmək üçün{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              giriş edin
            </button>
          </p>
        </div>
      )}

      {/* Promo Code Validation Message */}
      {promoValidation && (
        <div className={`p-4 rounded-lg text-sm ${
          promoValidation.valid 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {promoValidation.valid ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {promoValidation.message}
          </div>
          {promoValidation.valid && promoValidation.tier && (
            <div className="mt-2 font-medium">
              📦 Paket: {promoValidation.tier}
            </div>
          )}
        </div>
      )}

      {/* Application Result Message */}
      {promoMessage && (
        <div className={`p-4 rounded-lg text-sm ${
          promoMessage.includes('uğurla') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {promoMessage}
          {promoMessage.includes('uğurla') && (
            <div className="mt-2 text-xs">
              2 saniyə sonra dashboard-a yönləndiriləcəksiniz...
            </div>
          )}
        </div>
      )}

      {/* Sample Promo Codes for Testing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Test promokodları:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>• PREMIUM2024 (Premium)</div>
          <div>• PRO2024 (Pro)</div>
          <div>• WELCOME50 (Premium)</div>
          <div>• TESTCODE (Pro)</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Yalnız cari paketinizdən yüksək paketlər üçün kodlar işləyir
        </p>
      </div>
    </div>
  );
}
