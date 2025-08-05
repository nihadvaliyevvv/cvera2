// Authentication utilities for frontend
'use client';
import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // Add avatar property as optional
  createdAt?: string;
  loginMethod?: string; // Add login method (linkedin, email)
  linkedinId?: string; // Add LinkedIn ID field
  linkedinUsername?: string; // Add LinkedIn username field (optional until database is updated)
  tier?: string; // Add tier field to match Prisma schema
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  // LinkedIn auto-import functionality
  canAutoImportLinkedIn: () => boolean;
  importLinkedInProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const isValidToken = (token: string) => {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return false;
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);

      // Check if we're coming from a logout (URL parameter check)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('logout')) {
        console.log('Logout parameter detected, clearing everything');
        // Aggressive cleanup when logout parameter is detected
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // CRITICAL: If no token exists, immediately set user to null
      let token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found in localStorage');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Validate token before using it
      if (!isValidToken(token)) {
        console.log('Token expired or invalid, removing');
        localStorage.removeItem('accessToken');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Fetch user data with valid token
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.log('Failed to fetch user data, token invalid');
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    console.log('🔑 Login başladı:', email);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login API error:', error);
        throw new Error(error.error || 'Giriş uğursuz oldu');
      }

      const data = await response.json();
      console.log('✅ Login API success:', {
        hasAccessToken: !!data.accessToken,
        tokenLength: data.accessToken?.length,
        hasUser: !!data.user,
        userId: data.user?.id
      });

      // Validate token before storing
      if (data.accessToken && isValidToken(data.accessToken)) {
        console.log('💾 Storing token in localStorage');
        localStorage.setItem('accessToken', data.accessToken);

        // Verify token was stored
        const storedToken = localStorage.getItem('accessToken');
        console.log('🔍 Token stored check:', !!storedToken);

        // Fetch user data after successful login
        console.log('👤 Fetching user data...');
        await fetchCurrentUser();

        // Redirect to dashboard after successful login with replace to prevent back button issues
        if (typeof window !== 'undefined') {
          console.log('🔄 Redirecting to dashboard...');
          window.location.replace('/dashboard');
        }
      } else {
        console.error('❌ Invalid token received');
        throw new Error('Yanlış token alındı');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Qeydiyyat uğursuz oldu');
      }

      // After registration, automatically log in
      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    console.log('🚪 LOGOUT BAŞLADI - Dərhal təmizlik...');

    // Get user info before clearing to check login method
    const currentUser = user;
    const isLinkedInUser = currentUser?.loginMethod === 'linkedin';

    // 1. IMMEDIATE state clearing - no async delays
    setUser(null);
    setLoading(false);
    setIsInitialized(false);

    // 2. IMMEDIATE storage clearing - synchronous
    if (typeof window !== 'undefined') {
      try {
        // Clear all possible storage immediately
        localStorage.clear();
        sessionStorage.clear();

        // Clear specific items that might be cached
        ['accessToken', 'refreshToken', 'user', 'auth-token', 'cvera-auth', 'cvera-token'].forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        console.log('✅ Storage təmizləndi');
      } catch (e) {
        console.log('Storage clear error:', e);
      }
    }

    // 3. IMMEDIATE cookie clearing - synchronous
    if (typeof document !== 'undefined') {
      try {
        // More aggressive cookie clearing
        const cookiesToClear = [
          'accessToken', 'refreshToken', 'auth-token', 'session', 'token',
          'cvera-auth', 'cvera-token', 'next-auth.session-token', 'next-auth.csrf-token'
        ];

        cookiesToClear.forEach(name => {
          // Clear for current domain and path
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth;`;
        });

        console.log('✅ Cookies təmizləndi');
      } catch (e) {
        console.log('Cookie clear error:', e);
      }
    }

    // 4. Call logout API (fire and forget - don't wait)
    const token = localStorage.getItem('accessToken') || '';
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Cache-Control': 'no-cache',
      },
    }).then(() => {
      console.log('✅ Logout API çağırıldı');
    }).catch((error) => {
      console.log('Logout API error (ignoring):', error);
    });

    // 5. Handle LinkedIn logout if user logged in via LinkedIn
    if (isLinkedInUser) {
      console.log('🔗 LinkedIn ilə giriş edən istifadəçi - LinkedIn logout edilir...');

      // LinkedIn mobile logout URL (istədiyiniz URL)
      const linkedinLogoutUrl = 'https://linkedin.com/m/logout';

      // Show user confirmation before LinkedIn logout
      const confirmLinkedInLogout = confirm(
        'Siz LinkedIn ilə giriş etmişsiniz. LinkedIn-dən də çıxış etmək istəyirsiniz?'
      );

      if (confirmLinkedInLogout) {
        // Open LinkedIn logout in a new tab and auto-close after 2 seconds
        const logoutWindow = window.open(linkedinLogoutUrl, '_blank', 'width=600,height=400');

        // Close the logout window after 2 seconds
        setTimeout(() => {
          if (logoutWindow && !logoutWindow.closed) {
            logoutWindow.close();
            console.log('LinkedIn logout səhifəsi 2 saniyə sonra bağlandı');
          }
        }, 2000); // 2 saniyə
      }
    }

    // 6. IMMEDIATE redirect - no delays, no async waits
    if (typeof window !== 'undefined') {
      console.log('🔄 Login səhifəsinə yönləndirmə...');

      // Force immediate redirect with replace to prevent back button issues
      setTimeout(() => {
        window.location.replace('/auth/login?logout=success');
      }, 100); // Minimal delay to ensure cleanup completes
    }

    console.log('✅ LOGOUT TAMAMLANDI - İstifadəçi təmizləndi');
  }, [user]);

  const canAutoImportLinkedIn = useCallback((): boolean => {
    return user?.loginMethod === 'linkedin' && !!(user?.linkedinUsername || user?.linkedinId);
  }, [user]);

  const importLinkedInProfile = useCallback(async () => {
    if (!canAutoImportLinkedIn()) {
      throw new Error('LinkedIn auto-import yalnız LinkedIn ilə giriş edən istifadəçilər üçündür');
    }

    const token = localStorage.getItem('accessToken');
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
        throw new Error(error.error || 'LinkedIn profil import xətası');
      }

      const result = await response.json();
      console.log('✅ LinkedIn profil uğurla import edildi:', result.profile?.name);

      return result;
    } catch (error) {
      console.error('❌ LinkedIn import xətası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [canAutoImportLinkedIn]);

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export function generateJWT(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
}

export function generateRefreshToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
}
