'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import CVEditor from '@/components/cv/CVEditor';
import { LoadingSpinner } from '@/components/ui/Loading';
import { CVData } from '@/types/cv';

export default function EditCVPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cvId = params.id as string;
  const isNewCV = cvId === 'new';
  const importType = searchParams.get('import');
  const sessionId = searchParams.get('session');
  const dataParam = searchParams.get('data');
  
  // State for session-based import data
  const [sessionImportData, setSessionImportData] = useState(null);
  
  // Process imported data from URL or session
  let linkedInData = null;
  if (sessionImportData) {
    linkedInData = sessionImportData;
  } else if (dataParam) {
    try {
      linkedInData = JSON.parse(decodeURIComponent(dataParam));
    } catch (e) {
      console.error('Failed to parse LinkedIn data from URL:', e);
    }
  }

  // Debug logging
  console.log('Edit page debug:', {
    importType,
    sessionId,
    dataParam: dataParam ? 'present' : 'null',
    hasSessionData: !!sessionImportData,
    linkedInData: linkedInData ? 'present' : 'null',
    linkedInDataSample: linkedInData ? JSON.stringify(linkedInData).substring(0, 200) : 'null'
  });

  useEffect(() => {
    console.log('Edit page useEffect:', { 
      user: !!user, 
      authLoading, 
      cvId, 
      isNewCV 
    });
    
    if (!authLoading && !user) {
      console.log('No user, redirecting to home');
      router.push('/');
      return;
    }

    // Initialize data for new CV
    if (isNewCV && user) {
      console.log('New CV detected, setting loading to false');
      setLoading(false);
    }
    
    // For existing CV, CVEditor will handle loading
    if (!isNewCV && user) {
      console.log('Existing CV detected, setting loading to false');
      setLoading(false);
    }
  }, [user, authLoading, router, isNewCV, cvId]);

  // Load session import data if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      const loadSessionData = async () => {
        try {
          console.log('Loading session data for sessionId:', sessionId);
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/import/session?session=${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Session API response:', result);
            if (result.success && result.data) {
              console.log('Session data loaded successfully:', result.data);
              setSessionImportData(result.data);
            } else {
              console.error('Session data load failed:', result.error);
              setError('Import məlumatları yüklənərkən xəta baş verdi');
            }
          } else {
            console.error('Session response not ok:', response.status);
            setError('Import məlumatları yüklənərkən xəta baş verdi');
          }
        } catch (error) {
          console.error('Failed to load session import data:', error);
          setError('Import məlumatları yüklənərkən xəta baş verdi');
        }
      };
      
      loadSessionData();
    }
  }, [sessionId]);

  const handleSave = async (cvData: any) => {
    try {
      console.log('Edit page: CV saved successfully by CVEditor:', cvData);
      
      // CVEditor already handles the save operation, we just need to navigate
      // Redirect to dashboard or CV list
      router.push('/dashboard');
    } catch (err) {
      console.error('Edit page: CV save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`CV saxlanılarkən xəta baş verdi: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Xəta baş verdi</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Əsas səhifəyə qayıt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <CVEditor
        cvId={isNewCV ? undefined : cvId}
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={linkedInData}
        userTier={user?.subscriptions?.[0]?.tier || 'Free'}
      />
    </div>
  );
}
