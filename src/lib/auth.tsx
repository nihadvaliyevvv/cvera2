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
        throw new Error(error.error || 'Login failed');
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
        throw new Error('Invalid token received');
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
        throw new Error(error.error || 'Registration failed');
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
      // 1. Clear user state immediately to prevent UI issues
      setUser(null);
      setLoading(true);

      // 2. Clear all possible client-side storage
      const clearClientStorage = () => {
        localStorage.clear();
        sessionStorage.clear();

        // Clear specific tokens just in case
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('auth-token');
        sessionStorage.removeItem('user');
      };

      clearClientStorage();

      // 3. Call logout API to clear server-side session/cookies
      try {
        await Promise.allSettled([
          fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/auth/revoke', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ]);
      } catch (error) {
        console.error('Server logout error:', error);
      }

      // 4. Clear storage again to be extra sure
      clearClientStorage();

      // 5. Force page reload and redirect to home to completely reset state
      if (typeof window !== 'undefined') {
        // Use replace instead of href to prevent back button issues
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    throw new Error('useAuth must be used within an AuthProvider');
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
