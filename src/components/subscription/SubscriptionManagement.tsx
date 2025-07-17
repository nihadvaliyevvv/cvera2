'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  provider: string;
  expiresAt: string;
  startedAt: string;
}

interface SubscriptionManagementProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const TIER_FEATURES = {
  Free: {
    name: 'Pulsuz',
    price: '0₼',
    features: [
      'Sadə şablon',
      'PDF yükləmə',
      'Əsas məlumatlar',
    ],
    limitations: [
      'Yalnız 2 şablon',
      'Şəkil yükləmə yoxdur',
      'Məhdud dizayn',
    ],
    color: 'gray',
  },
  Medium: {
    name: 'Orta',
    price: '2.99₼',
    features: [
      'Orta səviyyə şablonlar',
      'Şəkil yükləmə mövcuddur',
      'PDF və DOCX yükləmə',
    ],
    limitations: [
      'Məhdud premium şablonlar',
    ],
    color: 'blue',
  },
  Premium: {
    name: 'Premium',
    price: '19.99₼',
    features: [
      'Bütün şablonlar',
      'Premium dizayn',
      'Limitsiz yükləmə',
      'Prioritet dəstək',
    ],
    limitations: [],
    color: 'purple',
  },
};

export default function SubscriptionManagement({ user, onUserUpdate }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentSubscription = user.subscriptions?.find(sub => sub.status === 'active');
  const currentTier = currentSubscription?.tier || 'Free';

  const handleUpgrade = async (newTier: string) => {
    // If upgrading to a paid tier, redirect to pricing page
    if (newTier !== 'Free') {
      window.location.href = '/pricing';
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: newTier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Abunəlik yenilənmədi');
      }

      const result = await response.json();
      
      // For Free tier, update user data immediately
      if (newTier === 'Free') {
        const updatedUser = { ...user };
        if (updatedUser.subscriptions) {
          updatedUser.subscriptions = updatedUser.subscriptions.map(sub => 
            sub.status === 'active' ? { ...sub, tier: newTier } : sub
          );
        }
        onUserUpdate(updatedUser);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Abunəliyi ləğv etmək istədiyinizdən əminsiniz?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Abunəlik ləğv edilmədi');
      }

      // Update user data
      const updatedUser = { ...user };
      if (updatedUser.subscriptions) {
        updatedUser.subscriptions = updatedUser.subscriptions.map(sub => 
          sub.status === 'active' ? { ...sub, status: 'cancelled' } : sub
        );
      }
      onUserUpdate(updatedUser);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Abunəlik İdarəsi</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazırkı Abunəlik</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentTier === 'Free' ? 'bg-gray-100 text-gray-800' :
                  currentTier === 'Medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES].name}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentSubscription?.status === 'active' ? 'bg-green-100 text-green-800' :
                  currentSubscription?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentSubscription?.status === 'active' ? 'Aktiv' : 
                   currentSubscription?.status === 'cancelled' ? 'Ləğv edilib' : 'Passiv'}
                </span>
              </div>
              
              {currentSubscription && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Başlama tarixi: {new Date(currentSubscription.startedAt).toLocaleDateString('az-AZ')}</p>
                  <p>Bitmə tarixi: {new Date(currentSubscription.expiresAt).toLocaleDateString('az-AZ')}</p>
                </div>
              )}
            </div>
            
            {currentSubscription && currentSubscription.status === 'active' && currentTier !== 'Free' && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
              >
                {loading ? 'Ləğv edilir...' : 'Abunəliyi Ləğv Et'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(TIER_FEATURES).map(([tier, info]) => (
          <div
            key={tier}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              currentTier === tier ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">{info.price}</div>
              <div className="text-sm text-gray-600">aylıq</div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Xüsusiyyətlər:</h4>
                <ul className="space-y-1">
                  {info.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {info.limitations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Məhdudiyyətlər:</h4>
                  <ul className="space-y-1">
                    {info.limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center">
              {currentTier === tier ? (
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium">
                  Hazırkı Planınız
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${
                    tier === 'Free' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' :
                    tier === 'Medium' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                    'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? 'Yenilənir...' : 
                   tier === 'Free' ? 'Pulsuz Plana Keç' :
                   currentTier === 'Free' ? 'Yükselt' : 
                   'Planı Dəyiş'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
