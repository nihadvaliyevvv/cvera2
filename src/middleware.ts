import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;

    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null;
    }

    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null;
    }

    store[key].count++;

    if (store[key].count > limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    return null;
  };
}

// Authentication helper functions
function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookies as fallback
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

function isValidToken(token: string): boolean {
  try {
    if (!process.env.JWT_SECRET) return false;

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    return decoded && decoded.exp && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/cv',
    '/profile',
    '/settings',
    '/premium',
    '/api/users',
    '/api/cv',
    '/api/import',
    '/api/premium'
  ];

  return protectedPaths.some(path => pathname.startsWith(path));
}

function isAuthRoute(pathname: string): boolean {
  const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  return authPaths.some(path => pathname.startsWith(path));
}

function isPublicApiRoute(pathname: string): boolean {
  const publicApiPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/refresh-token',
    '/api/auth/linkedin',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health'
  ];

  return publicApiPaths.some(path => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to all API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResult = rateLimit()(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  // Check for logout indicators in URL and clear cookies
  const url = request.nextUrl;
  if (url.searchParams.has('logout') || url.searchParams.has('nuclear_logout') || url.searchParams.has('emergency_logout')) {
    const response = NextResponse.next();

    // Clear all auth cookies
    const cookiesToClear = [
      'auth-token', 'accessToken', 'refreshToken', 'session',
      'cvera-auth', 'cvera-token', 'next-auth.session-token'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
    });

    return response;
  }

  // Handle public API routes (no authentication required)
  if (pathname.startsWith('/api/') && isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle protected API routes
  if (pathname.startsWith('/api/') && !isPublicApiRoute(pathname)) {
    const token = getTokenFromRequest(request);

    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { error: 'Giriş tələb olunur', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Add user info to headers for API routes
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const response = NextResponse.next();
      response.headers.set('x-user-id', decoded.userId);
      response.headers.set('x-user-email', decoded.email);
      return response;
    } catch {
      return NextResponse.json(
        { error: 'Token yanlışdır', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
  }

  // Handle protected page routes
  if (isProtectedRoute(pathname)) {
    const token = getTokenFromRequest(request);

    if (!token || !isValidToken(token)) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth routes (redirect if already logged in)
  if (isAuthRoute(pathname)) {
    const token = getTokenFromRequest(request);

    if (token && isValidToken(token)) {
      // Redirect to dashboard if already authenticated
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
