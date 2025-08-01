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

      // 1. Immediately set user to null and clear state
      setUser(null);
      setLoading(false);
      setIsInitialized(false);

      // 2. Comprehensive client storage clearing function
      const clearAllStorage = () => {
        if (typeof window !== 'undefined') {
          // Clear localStorage completely
          try {
            localStorage.clear();
          } catch (e) {
            console.error('LocalStorage clear error:', e);
          }

          // Clear sessionStorage completely
          try {
            sessionStorage.clear();
          } catch (e) {
            console.error('SessionStorage clear error:', e);
          }

          // Clear specific tokens as extra safety
          const tokensToRemove = [
            'accessToken', 'refreshToken', 'auth-token', 'user', 'token',
            'linkedin-token', 'session', 'authData', 'userData', 'loginData',
            'cvera-auth', 'cvera-token', 'cvera-user'
          ];

          tokensToRemove.forEach(token => {
            try {
              localStorage.removeItem(token);
              sessionStorage.removeItem(token);
            } catch (e) {
              // Ignore individual token removal errors
            }
          });

          // Force clear browser data
          try {
            // Clear any potential IndexedDB data
            if ('indexedDB' in window) {
              indexedDB.deleteDatabase('cvera-cache');
            }
          } catch (e) {
            // Ignore IndexedDB errors
          }
        }
      };

      // 3. Clear storage immediately
      clearAllStorage();

      // 4. Call logout API and wait for it to complete
      if (typeof window !== 'undefined') {
        const logoutAPICalls = async () => {
          try {
            // Call multiple logout endpoints to ensure complete logout
            await Promise.allSettled([
              fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                },
              }),
              fetch('/api/auth/revoke', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                },
              })
            ]);

            // Clear storage again after API calls
            clearAllStorage();

            console.log('✅ Logout API çağrıları tamamlandı');

            // Force redirect with cache busting
            const timestamp = Date.now();
            window.location.href = `/auth/login?logout=true&t=${timestamp}`;

          } catch (error) {
            console.error('Logout API error:', error);
            // Even if API fails, clear storage and redirect
            clearAllStorage();
            window.location.href = `/auth/login?logout=true&force=true`;
          }
        };

        // Execute logout API calls
        logoutAPICalls();
      }

    } catch (error) {
      console.error('Logout error:', error);

      // Emergency fallback: nuclear option
      if (typeof window !== 'undefined') {
        try {
          // Clear everything possible
          localStorage.clear();
          sessionStorage.clear();

          // Force page reload to clear any cached state
          window.location.replace('/auth/login?logout=true&emergency=true');
        } catch (e) {
          // Last resort
          window.location.href = '/auth/login';
        }
      }

      // Set state to logged out even on error
      setUser(null);
      setLoading(false);
      setIsInitialized(false);
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
