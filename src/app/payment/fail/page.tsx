'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const transactionId = searchParams.get('transactionId');
  const orderId = searchParams.get('orderId');
  const errorMessage = searchParams.get('error') || 'Ödəniş zamanı xəta baş verdi';

  useEffect(() => {
    // Log failed payment for debugging
    if (transactionId && orderId) {
      console.log('Payment failed:', { transactionId, orderId, errorMessage });
    }
  }, [transactionId, orderId, errorMessage]);

  const handleTryAgain = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ödəniş Uğursuz
            </h2>
            
            <p className="text-gray-600 mb-6">
              Ödəniş zamanı problem yarandı
            </p>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    <strong>Xəta səbəbi:</strong> {errorMessage}
                  </p>
                </div>
              </div>
            </div>

            {transactionId && orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Əməliyyat Məlumatları
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sifariş ID:</span>
                    <span className="font-mono text-xs">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tranzaksiya ID:</span>
                    <span className="font-mono text-xs">{transactionId}</span>
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
                    <strong>Tövsiyələr:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>Kart məlumatlarını yoxlayın</li>
                    <li>Kifayət qədər balans olub-olmadığını yoxlayın</li>
                    <li>Bir neçə dəqiqə sonra yenidən cəhd edin</li>
                    <li>Problem davam edərsə, dəstək komandası ilə əlaqə saxlayın</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Yenidən Cəhd Et
              </button>
              
              <Link
                href="/dashboard"
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium inline-block text-center"
              >
                Dashboard-a Qayıt
              </Link>
              
              <Link
                href="mailto:support@cvera.az?subject=Ödəniş Problemi&body=Tranzaksiya ID: {transactionId}%0ASifariş ID: {orderId}%0AXəta: {errorMessage}"
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors font-medium inline-block text-center"
              >
                Dəstək Komandası ilə Əlaqə
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
