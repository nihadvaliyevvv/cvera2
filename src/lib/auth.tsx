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
        console.log('Logout parameter detected, skipping auth check');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // First try to get token from localStorage
      let token = localStorage.getItem('accessToken');

      // Validate token before using it
      if (token && !isValidToken(token)) {
        console.log('Token expired, removing from localStorage');
        localStorage.removeItem('accessToken');
        token = null;
      }

      // If no valid token in localStorage, try to get from cookies via API
      if (!token) {
        try {
          const response = await fetch('/api/auth/token', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (response.ok) {
            const data = await response.json();
            token = data.accessToken;

            // Validate token from server
            if (token && isValidToken(token)) {
              localStorage.setItem('accessToken', token);
            } else {
              token = null;
            }
          }
        } catch (error) {
          console.error('Error getting token from cookie:', error);
        }
      }

      if (!token) {
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
        console.log('Failed to fetch user data, removing token');
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
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Giriş uğursuz oldu');
      }

      const data = await response.json();

      // Validate token before storing
      if (data.accessToken && isValidToken(data.accessToken)) {
        localStorage.setItem('accessToken', data.accessToken);

        // Fetch user data after successful login
        await fetchCurrentUser();

        // Redirect to dashboard after successful login with replace to prevent back button issues
        if (typeof window !== 'undefined') {
          window.location.replace('/dashboard');
        }
      } else {
        throw new Error('Yanlış token alındı');
      }
    } catch (error) {
      console.error('Login error:', error);
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
    try {
      console.log('🚪 Logout prosesi başlayır...');

      // 1. Clear user state immediately to prevent UI issues
      setUser(null);
      setLoading(false);
      setIsInitialized(false);

      // 2. Clear all possible client-side storage immediately
      const clearClientStorage = () => {
        if (typeof window !== 'undefined') {
          // Clear localStorage completely
          localStorage.clear();
          // Clear sessionStorage completely
          sessionStorage.clear();

          // Also clear specific tokens as backup
          const tokensToRemove = [
            'accessToken', 'refreshToken', 'auth-token', 'user', 'token',
            'linkedin-token', 'session', 'authData'
          ];

          tokensToRemove.forEach(token => {
            try {
              localStorage.removeItem(token);
              sessionStorage.removeItem(token);
            } catch (e) {
              // Ignore storage errors
            }
          });
        }
      };

      // Clear storage immediately
      clearClientStorage();

      // 3. Call logout API in background (don't wait for it)
      if (typeof window !== 'undefined') {
        // Fire and forget API calls
        Promise.allSettled([
          fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch(() => {}),
          fetch('/api/auth/revoke', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch(() => {})
        ]).catch(() => {}); // Complete fire and forget
      }

      // 4. Clear storage one more time
      setTimeout(() => {
        clearClientStorage();
      }, 100);

      console.log('✅ Logout tamamlandı, login səhifəsinə yönləndirilib');

      // 5. Immediate redirect to login page
      if (typeof window !== 'undefined') {
        // Small delay to ensure state is cleared
        setTimeout(() => {
          window.location.replace('/auth/login');
        }, 150);
      }

    } catch (error) {
      console.error('Logout error:', error);

      // Fallback: clear everything and redirect anyway
      setUser(null);
      setLoading(false);
      setIsInitialized(false);

      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignore storage errors
        }

        // Force redirect even on error
        window.location.replace('/auth/login');
      }
    }
  }, []);

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
