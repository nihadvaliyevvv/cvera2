'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DemoPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(5);

  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!transactionId || !amount || !orderId) {
      router.push('/dashboard');
      return;
    }

    // Demo ödəniş prosesi simulasiyası
    const simulatePayment = async () => {
      setPaymentStatus('processing');
      
      // 2 saniyə gözlə
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 90% hallarda uğurlu
      const success = Math.random() > 0.1;
      
      if (success) {
        setPaymentStatus('success');
        
        // Countdown başlat
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Success page-ə yönləndir
              router.push(`/payment/success?transactionId=${transactionId}&orderId=${orderId}`);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setPaymentStatus('failed');
      }
    };

    simulatePayment();
  }, [transactionId, amount, orderId, router]);

  const handleTryAgain = () => {
    router.push('/pricing');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Demo Ödəniş Prosesi
            </h2>
            
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Məbləğ:</div>
              <div className="text-2xl font-bold text-blue-600">{amount} AZN</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Sifariş ID:</div>
              <div className="text-sm font-mono text-gray-800">{orderId}</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Tranzaksiya ID:</div>
              <div className="text-sm font-mono text-gray-800">{transactionId}</div>
            </div>

            {paymentStatus === 'pending' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Ödəniş başlayır...</p>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Ödəniş işlənir...</p>
                <div className="mt-4 bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    🧪 Bu demo ödənişdir. Real pul çəkilmir.
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ödəniş Uğurlu!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {countdown} saniyə sonra yönləndirilirsiniz...
                </p>
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-green-700">
                    ✅ Demo ödəniş tamamlandı. Abunəliyiniz aktivləşdirildi.
                  </p>
                </div>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ödəniş Uğursuz</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Demo ödəniş uğursuz oldu. Yenidən cəhd edə bilərsiniz.
                </p>
                <div className="bg-red-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-red-700">
                    ❌ Bu demo xətasıdır. Real ödənişdə fərqli səbəblər ola bilər.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Yenidən Cəhd Et
                  </button>
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Əsas Səhifəyə Qayıt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
