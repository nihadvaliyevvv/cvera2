'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LinkedInCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('İnkişaf edir...');

  useEffect(() => {
    const processLinkedInCallback = async () => {
      try {
        setStatus('LinkedIn girişi tamamlanır...');

        // Get token from cookies
        const response = await fetch('/api/auth/token', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();

          if (data.accessToken) {
            // Store token in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            setStatus('Uğurlu! Dashboard-a yönləndirilirsiz...');

            // Wait a moment then redirect
            setTimeout(() => {
              router.replace('/dashboard');
            }, 1500);
          } else {
            throw new Error('Token alınmadı');
          }
        } else {
          throw new Error('Token yoxlanması uğursuz');
        }
      } catch (error) {
        console.error('LinkedIn callback error:', error);
        setStatus('Xəta baş verdi. Yenidən cəhd edin.');
        setTimeout(() => {
          router.replace('/auth/login?error=linkedin_callback_failed');
        }, 2000);
      }
    };

    processLinkedInCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">LinkedIn Girişi</h2>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
