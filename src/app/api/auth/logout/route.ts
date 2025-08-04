import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    console.log('🚪 Logout API called');

    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    // Get request body for additional flags
    let requestBody: any = {};
    try {
      requestBody = await request.json();
    } catch (e) {
      // Ignore JSON parse errors
    }

    const { logoutFromLinkedIn, revokeLinkedInToken } = requestBody;

    // If we have a token, try to update user's session in database
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as any;

        if (decoded?.userId) {
          console.log('🗃️ Clearing user session for:', decoded.userId);

          // Get user info for LinkedIn logout
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
          });

          // Update user's last login to track logout (optional)
          // Since we don't have lastLogout field, we'll just log the action
          console.log('✅ User logout tracked for:', decoded.userId);

          // Log LinkedIn logout attempt (without trying to revoke stored tokens)
          if (revokeLinkedInToken && user?.loginMethod === 'linkedin') {
            console.log('🔗 LinkedIn user logout - clearing session data...');
            // Note: We don't store LinkedIn access tokens in the database for security
            // LinkedIn logout is handled client-side via popup and cookie clearing
          }
        }
      } catch (e) {
        console.log('Token decode error (ignored):', e);
      }
    }

    const response = NextResponse.json({
      message: "Uğurla çıxış edildi",
      timestamp: new Date().toISOString(),
      cleared: true,
      linkedinLogout: logoutFromLinkedIn || false
    });

    // Comprehensive cookie clearing for ALL possible auth cookies
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
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "authToken",
      "user-token",
      "jwt-token",
      // LinkedIn-specific cookies
      "li_at",
      "liap",
      "li_rm",
      "li_gc",
      "bcookie",
      "bscookie"
    ];

    // Clear cookies for multiple paths and domains
    const paths = ["/", "/api", "/auth", "/dashboard"];
    const domains = [undefined, process.env.NEXT_PUBLIC_DOMAIN, ".linkedin.com", "linkedin.com"];

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

    // Add LinkedIn logout headers if needed
    if (logoutFromLinkedIn) {
      response.headers.set('X-LinkedIn-Logout', 'true');
    }

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, still return success for logout
    const response = NextResponse.json({
      message: "Çıxış edildi",
      timestamp: new Date().toISOString(),
      error: "Partial cleanup"
    });

    // Clear cookies anyway
    const cookiesToClear = ["auth-token", "accessToken", "refreshToken"];
    cookiesToClear.forEach(cookieName => {
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
  } finally {
    await prisma.$disconnect();
  }
}
