// JWT utilities for server-side authentication
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    if (!token || !process.env.JWT_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Additional validation
    if (!decoded.userId || !decoded.email) return null;

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function generateJWT(payload: { userId: string; email: string }): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'cvera-app',
    audience: 'cvera-users'
  });
}

export function generateRefreshToken(payload: { userId: string; email: string }): string {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
    issuer: 'cvera-app',
    audience: 'cvera-refresh'
  });
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    if (!token || !process.env.JWT_REFRESH_SECRET) return null;

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JWTPayload;

    // Additional validation
    if (!decoded.userId || !decoded.email) return null;

    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Token validation utilities
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

// Session management utilities
export function createSessionCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  };
}

export function createRefreshCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}
