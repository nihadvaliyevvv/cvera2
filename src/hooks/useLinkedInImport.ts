import { useState, useCallback } from 'react';

export interface LinkedInImportLimits {
  canImport: boolean;
  remainingImports: number;
  userTier: string;
  limits: {
    Free: number;
    Medium: number;
    Premium: string;
  };
}

export interface LinkedInImportResult {
  success: boolean;
  cvId?: string;
  profile?: {
    name: string;
    headline: string;
    location: string;
    experienceCount?: number;
    educationCount?: number;
    skillsCount?: number;
  };
  error?: string;
  remainingImports?: number;
}

export interface UseLinkedInImportReturn {
  importProfile: (linkedinUrl: string) => Promise<LinkedInImportResult>;
  checkLimits: () => Promise<LinkedInImportLimits | null>;
  isLoading: boolean;
  error: string | null;
  limits: LinkedInImportLimits | null;
}

export function useLinkedInImport(): UseLinkedInImportReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<LinkedInImportLimits | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const checkLimits = useCallback(async (): Promise<LinkedInImportLimits | null> => {
    try {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return null;
      }

      const response = await fetch('/api/import/linkedin', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to check import limits');
        return null;
      }

      const limitsData: LinkedInImportLimits = await response.json();
      setLimits(limitsData);
      return limitsData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check import limits';
      setError(errorMessage);
      return null;
    }
  }, []);

  const importProfile = useCallback(async (linkedinUrl: string): Promise<LinkedInImportResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!linkedinUrl?.trim()) {
        throw new Error('LinkedIn URL or username is required');
      }

      const response = await fetch('/api/import/linkedin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinUrl: linkedinUrl.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import LinkedIn profile');
      }

      // Update limits after successful import
      if (data.remainingImports !== undefined && limits) {
        setLimits({
          ...limits,
          remainingImports: data.remainingImports,
          canImport: data.remainingImports > 0 || limits.userTier === 'Premium'
        });
      }

      return {
        success: true,
        cvId: data.cvId,
        profile: data.profile,
        remainingImports: data.remainingImports
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import LinkedIn profile';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [limits]);

  return {
    importProfile,
    checkLimits,
    isLoading,
    error,
    limits
  };
}
