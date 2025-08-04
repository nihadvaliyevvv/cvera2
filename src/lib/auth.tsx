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

      // 1. Dərhal user-i null et və state-i təmizlə
      setUser(null);
      setLoading(false);
      setIsInitialized(false);

      // 2. Gücləndirilmiş storage təmizliyi funksiyası
      const clearStorage = () => {
        if (typeof window !== 'undefined') {
          try {
            // localStorage-ı tamamilə təmizlə
            localStorage.clear();
            sessionStorage.clear();

            // Həmçinin xüsusi auth key-ləri təmizlə
            const authKeys = [
              'auth-token',
              'accessToken',
              'refreshToken',
              'user',
              'token',
              'session',
              'cvera-auth',
              'jwt-token',
              'userSession'
            ];

            authKeys.forEach(key => {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            });

            console.log('✅ Storage tamamilə təmizləndi');
          } catch (e) {
            console.error('Storage təmizliyi xətası:', e);
          }
        }
      };

      // 3. Storage-ı dərhal təmizlə
      clearStorage();

      // 4. Gücləndirilmiş logout API çağırışı
      if (typeof window !== 'undefined') {
        // Cari token-i logout request ilə göndər
        const currentToken = localStorage.getItem('auth-token') ||
                           localStorage.getItem('accessToken') ||
                           localStorage.getItem('token');

        // Token ilə logout çağırışı et
        fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            sessionTerminate: true
          })
        }).then(response => {
          console.log('✅ Logout API çağırışı tamamlandı:', response.status);
          // API çağırışından sonra storage-ı yenidən təmizlə
          clearStorage();
        }).catch(error => {
          console.error('Logout API xətası (davam edirik):', error);
          // API uğursuz olsa belə storage-ı təmizlə
          clearStorage();
        });

        // 5. Cache və IndexedDB təmizliyi
        try {
          // Cache-lanmış API cavablarını təmizlə
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name);
              });
            });
          }
        } catch (e) {
          console.error('Cache təmizliyi xətası:', e);
        }

        // 6. Dərhal redirect cache busting ilə
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);

        // href əvəzinə replace istifadə et ki, geri düyməsi problemi olmasın
        window.location.replace(`/auth/login?logout=true&t=${timestamp}&r=${randomId}`);
      }

    } catch (error) {
      console.error('Logout xətası:', error);

      // Təcili fallback - daha aqressiv təmizlik
      if (typeof window !== 'undefined') {
        try {
          // Nuclear seçim - hər şeyi təmizlə
          localStorage.clear();
          sessionStorage.clear();

          // document.cookie vasitəsilə cookie-ləri təmizlə (ehtiyat kimi)
          document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
              // Müxtəlif path və domain-lər üçün təmizlə
              const paths = ["/", "/api", "/auth", "/dashboard"];
              const domains = ["", ".cvera.net", "cvera.net"];

              paths.forEach(path => {
                domains.forEach(domain => {
                  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; ${domain ? `domain=${domain};` : ''}`;
                });
              });
            }
          });

          window.location.replace('/auth/login?logout=true&emergency=true');
        } catch (e) {
          console.error('Təcili logout uğursuz:', e);
          window.location.replace('/auth/login');
        }
      }

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
