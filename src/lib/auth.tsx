// Authentication utilities for frontend
'use client';
import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  loginMethod?: string;
  linkedinId?: string;
  linkedinUsername?: string;
  tier?: string;
  subscriptions: Array<{
    id: string;
    tier: string;
    status: string;
    provider: string;
    expiresAt: string;
    startedAt: string;
  }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  canAutoImportLinkedIn: () => boolean;
  importLinkedInProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced token validation with proper JWT decoding
  const isValidToken = (token: string) => {
    try {
      if (!token) return false;

      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp && payload.exp > currentTime;
    } catch {
      return false;
    }
  };

  // Token management utilities
  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  };

  const setStoredToken = (token: string | null) => {
    if (typeof window === 'undefined') return;

    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };

  const clearAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear all auth-related localStorage items
    const authKeys = ['accessToken', 'refreshToken', 'user', 'auth_timestamp'];
    authKeys.forEach(key => localStorage.removeItem(key));

    // Clear session storage
    sessionStorage.clear();
  };

  // Enhanced token refresh functionality
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken && isValidToken(data.accessToken)) {
          setStoredToken(data.accessToken);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Enhanced user fetching with proper error handling
  const fetchCurrentUser = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);

      // Check for logout indicators
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('logout') || urlParams.has('logged_out') || urlParams.has('nuclear_logout')) {
        console.log('Logout indicator detected, clearing auth state');
        clearAuthData();
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      let token = getStoredToken();

      // Validate existing token
      if (token && !isValidToken(token)) {
        console.log('Token expired, attempting refresh...');
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          token = getStoredToken();
        } else {
          console.log('Token refresh failed, clearing auth data');
          clearAuthData();
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }
      }

      if (!token) {
        console.log('No valid token found');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Fetch user data with retry logic
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated:', userData.email);
        setUser(userData);
      } else if (response.status === 401) {
        // Token invalid, try refresh one more time
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry with new token
          const retryResponse = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${getStoredToken()}`,
              'Cache-Control': 'no-cache',
            },
          });

          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            setUser(userData);
          } else {
            throw new Error('Authentication failed after refresh');
          }
        } else {
          throw new Error('Token refresh failed');
        }
      } else {
        throw new Error(`User fetch failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      clearAuthData();
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [refreshToken]);

  // Enhanced login with proper error handling
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Giriş uğursuz oldu');
      }

      const data = await response.json();

      if (data.accessToken && isValidToken(data.accessToken)) {
        setStoredToken(data.accessToken);
        setUser(data.user);

        // Redirect with proper cleanup
        if (typeof window !== 'undefined') {
          // Clear any logout flags from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('logout');
          url.searchParams.delete('logged_out');
          window.history.replaceState({}, '', url.toString());

          // Redirect to dashboard
          window.location.replace('/dashboard');
        }
      } else {
        throw new Error('Token alınmadı');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced registration
  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Qeydiyyat uğursuz oldu');
      }

      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Enhanced logout with proper cleanup
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');

      const isLinkedInUser = user?.loginMethod === 'linkedin';
      const currentToken = getStoredToken();

      // Immediately clear local state
      setUser(null);
      setLoading(false);
      clearAuthData();

      // Call logout API first
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            logoutFromLinkedIn: isLinkedInUser,
            clearAllSessions: true,
            revokeLinkedInToken: isLinkedInUser
          })
        });
      } catch (error) {
        console.error('Logout API error (ignored):', error);
      }

      // Enhanced LinkedIn logout process
      if (isLinkedInUser && typeof window !== 'undefined') {
        console.log('🔗 LinkedIn logout başlayır...');

        // Method 1: Direct LinkedIn logout
        try {
          const linkedinLogoutWindow = window.open(
            'https://www.linkedin.com/m/logout/',
            'linkedin_logout',
            'width=600,height=400,scrollbars=yes,resizable=yes'
          );

          // Wait a bit for logout to process
          setTimeout(() => {
            if (linkedinLogoutWindow) {
              linkedinLogoutWindow.close();
            }
          }, 3000);

        } catch (e) {
          console.log('LinkedIn popup logout failed, trying alternative...');
        }

        // Method 2: Clear LinkedIn-related storage
        try {
          // Clear LinkedIn-specific localStorage and sessionStorage
          const linkedinKeys = Object.keys(localStorage).filter(key =>
            key.toLowerCase().includes('linkedin') ||
            key.toLowerCase().includes('li_')
          );

          linkedinKeys.forEach(key => {
            localStorage.removeItem(key);
          });

          const linkedinSessionKeys = Object.keys(sessionStorage).filter(key =>
            key.toLowerCase().includes('linkedin') ||
            key.toLowerCase().includes('li_')
          );

          linkedinSessionKeys.forEach(key => {
            sessionStorage.removeItem(key);
          });

          console.log('✅ LinkedIn storage cleared');
        } catch (e) {
          console.log('LinkedIn storage clear error:', e);
        }

        // Method 3: Clear LinkedIn cookies manually
        try {
          const linkedinCookies = [
            'li_at',
            'liap',
            'li_rm',
            'li_gc',
            'li_mc',
            'bcookie',
            'bscookie',
            'li_sugr',
            'liveagent_oref',
            'liveagent_ptid',
            'li_oatml',
            'UserMatchHistory'
          ];

          linkedinCookies.forEach(cookieName => {
            // Clear for different domains
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.linkedin.com;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=linkedin.com;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });

          console.log('✅ LinkedIn cookies cleared');
        } catch (e) {
          console.log('LinkedIn cookie clear error:', e);
        }
      }

      // Redirect with proper cleanup
      if (typeof window !== 'undefined') {
        const timestamp = Date.now();
        const logoutParams = new URLSearchParams({
          logout: 'true',
          t: timestamp.toString()
        });

        if (isLinkedInUser) {
          logoutParams.set('linkedin_logout', 'true');
        }

        // Force complete page replacement
        window.location.replace(`/auth/login?${logoutParams.toString()}`);
      }

    } catch (error) {
      console.error('Logout error:', error);

      // Emergency fallback
      if (typeof window !== 'undefined') {
        clearAuthData();
        window.location.replace('/auth/login?emergency_logout=true');
      }
    }
  }, [user]);

  // LinkedIn auto-import functionality
  const canAutoImportLinkedIn = useCallback((): boolean => {
    return user?.loginMethod === 'linkedin' && !!(user?.linkedinUsername || user?.linkedinId);
  }, [user]);

  const importLinkedInProfile = useCallback(async () => {
    if (!canAutoImportLinkedIn()) {
      throw new Error('LinkedIn auto-import yalnız LinkedIn istifadəçiləri üçündür');
    }

    const token = getStoredToken();
    if (!token) {
      throw new Error('Giriş tələb olunur');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/import/linkedin-auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'LinkedIn import xətası');
      }

      const result = await response.json();
      console.log('✅ LinkedIn profil import edildi');
      return result;
    } catch (error) {
      console.error('❌ LinkedIn import xətası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [canAutoImportLinkedIn]);

  // Initialize authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const value = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshToken,
    canAutoImportLinkedIn,
    importLinkedInProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth yalnız AuthProvider daxilində istifadə edilməlidir');
  }
  return context;
}

export function getUserTier(user: User): string {
  const activeSubscription = user.subscriptions?.find(sub => sub.status === 'active');
  return activeSubscription?.tier || 'Free';
}

// JWT functions for backend API use
export function verifyJWT(token: string): { userId: string; email: string } | null {
  try {
    if (!token || typeof window !== 'undefined') return null; // Client-side safety

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export function generateJWT(payload: { userId: string; email: string }): string {
  if (typeof window !== 'undefined') throw new Error('JWT generation only on server');

  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
}
