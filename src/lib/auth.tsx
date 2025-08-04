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
        throw new Error(error.message || error.error || 'Giriş uğursuz oldu');
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

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logout prosesi başlayır...');
      setLoading(true);

      // 1. Get current token and user info for LinkedIn logout check
      const token = localStorage.getItem('accessToken');
      const currentUser = user; // Store current user before clearing state

      // 2. Immediately clear client-side state
      setUser(null);
      setIsInitialized(false);

      // 3. Clear all storage immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();

          // Clear any other possible storage keys
          ['accessToken', 'refreshToken', 'user', 'auth-token', 'cvera-token'].forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });
        } catch (e) {
          console.error('Storage clear error:', e);
        }
      }

      // 4. If user logged in with LinkedIn, force LinkedIn logout
      if (currentUser?.loginMethod === 'linkedin') {
        try {
          console.log('🔗 LinkedIn hesabı aşkarlandı - LinkedIn-dən də çıxış edilir...');

          // Import LinkedIn logout functions
          const { forceLinkedInLogout, forceLinkedInLogoutPopup } = await import('@/utils/linkedinAuth');

          // Try iframe method first, fallback to popup if needed
          try {
            await forceLinkedInLogout();
          } catch (error) {
            console.log('⚠️ Iframe method failed, trying popup method...');
            await forceLinkedInLogoutPopup();
          }

          console.log('✅ LinkedIn logout tamamlandı');
        } catch (error) {
          console.error('❌ LinkedIn logout xətası:', error);
          // Continue with normal logout even if LinkedIn logout fails
        }
      }

      // 5. Call logout API with proper error handling
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add token to header if available
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Server logout successful:', data.message);
        } else {
          console.warn('⚠️ Server logout failed but continuing with client logout');
        }
      } catch (apiError) {
        console.error('❌ Logout API error:', apiError);
        // Continue with logout even if API fails
      }

      // 6. Force reload to ensure clean state
      if (typeof window !== 'undefined') {
        // Use replace to prevent back button issues
        const timestamp = Date.now();
        window.location.replace(`/auth/login?logout=true&t=${timestamp}`);
      }

    } catch (error) {
      console.error('❌ Logout error:', error);

      // Emergency fallback - ensure user is logged out no matter what
      setUser(null);
      setIsInitialized(false);
      setLoading(false);

      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace('/auth/login?logout=true&emergency=true');
        } catch (e) {
          // Last resort
          window.location.href = '/auth/login';
        }
      }
    }
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
