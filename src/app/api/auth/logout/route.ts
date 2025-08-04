import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyJWT, blacklistToken, blacklistAllUserTokens, cleanupExpiredTokens } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('🚪 Logout API called');

    // Clean up expired tokens first
    await cleanupExpiredTokens();

    // Get token from header or cookies
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '') || null;

    // Also check cookies for token
    const cookies = request.headers.get('cookie');
    const cookieToken = cookies?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1] || null;

    const token = headerToken || cookieToken;
    let userId: string | null = null;

    if (token) {
      try {
        // Verify and get user info from token
        const decoded = await verifyJWT(token);
        if (decoded) {
          userId = decoded.userId;
          console.log(`🔓 Logging out user: ${userId}`);

          // Blacklist the current token
          await blacklistToken(token, userId);

          // Optional: Blacklist all user tokens for complete logout from all devices
          // await blacklistAllUserTokens(userId);

          // Update user's lastLogin to null to force re-authentication
          await prisma.user.update({
            where: { id: userId },
            data: { lastLogin: null }
          }).catch(() => {}); // Ignore errors
        }
      } catch (error) {
        console.error('Token verification error during logout:', error);
        // Continue with logout even if token verification fails
      }
    }

    const response = NextResponse.json({
      message: "Uğurla çıxış edildi",
      timestamp: new Date().toISOString(),
      cleared: true,
      userId: userId || 'unknown'
    });

    // Clear all possible authentication cookies
    const cookiesToClear = [
      "auth-token",
      "accessToken",
      "refreshToken",
      "session",
      "token",
      "cvera-auth",
      "cvera-token",
      "next-auth.session-token",
      "next-auth.csrf-token",
      "user-session",
      "jwt-token"
    ];

    // Clear cookies for multiple paths and domains
    const paths = ["/", "/api", "/auth", "/dashboard"];
    const domains = [undefined, ".cvera.net", "cvera.net", "localhost"];

    cookiesToClear.forEach(cookieName => {
      paths.forEach(path => {
        domains.forEach(domain => {
          const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: path,
            maxAge: 0,
            expires: new Date(0),
          };

          if (domain && domain !== "localhost") {
            cookieOptions.domain = domain;
          }

          response.cookies.set(cookieName, "", cookieOptions);
        });
      });
    });

    // Add comprehensive cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

    console.log('✅ Logout completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);

    // Even on error, return success response with cookie clearing
    const response = NextResponse.json({
      message: "Çıxış edildi",
      timestamp: new Date().toISOString(),
      error: "Xəta baş verdi, lakin çıxış tamamlandı"
    });

    // Still clear cookies even on error
    const essentialCookies = ["auth-token", "accessToken", "refreshToken"];
    essentialCookies.forEach(cookieName => {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    });

    return response;
  }
}
