'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string;
    orderId: string;
    amount?: number;
    planType?: string;
  } | null>(null);

  const transactionId = searchParams.get('transactionId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!transactionId || !orderId) {
      router.push('/pricing');
      return;
    }

    // Verify payment and activate subscription
    const verifyPayment = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const isDevelopment = searchParams.get('development') === 'true';
        
        // Choose the appropriate endpoint based on mode
        const endpoint = isDevelopment 
          ? '/api/payments/complete-development'
          : '/api/payments/verify'; // Use a different endpoint for real payments
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            transactionId,
            orderId
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          setPaymentDetails({
            transactionId,
            orderId,
            amount: 9.99, // Demo amount
            planType: result.tier || 'Medium'
          });
          
          console.log('✅ Subscription activated:', result);
        } else {
          console.error('Payment verification failed:', response.status);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Payment verification failed:', error);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [transactionId, orderId, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ödəniş yoxlanılır...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ödəniş Uğurlu!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Abunəliyiniz uğurla aktivləşdirildi
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Ödəniş Məlumatları
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{paymentDetails.planType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Məbləğ:</span>
                    <span className="font-medium">{paymentDetails.amount} AZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sifariş ID:</span>
                    <span className="font-mono text-xs">{paymentDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tranzaksiya ID:</span>
                    <span className="font-mono text-xs">{paymentDetails.transactionId}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Yeni xüsusiyyətlər:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>Resumonk Bold template</li>
                    <li>DOCX export imkanı</li>
                    <li>LinkedIn import</li>
                    <li>Prioritet dəstək</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium inline-block text-center"
              >
                Dashboard-a Get
              </Link>
              
              <Link
                href="/cv/new"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium inline-block text-center"
              >
                Yeni CV Yarat
              </Link>
              
              <Link
                href="/pricing"
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block text-center"
              >
                Planları Gör
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
