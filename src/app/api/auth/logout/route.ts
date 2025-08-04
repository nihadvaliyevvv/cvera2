import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    let wasLinkedInLogin = false;

    if (token) {
      // Try to extract user ID from token for database cleanup
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as any;

        if (decoded?.userId) {
          // Get user info to check login method
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { loginMethod: true }
          }).catch(() => null);

          wasLinkedInLogin = user?.loginMethod === 'linkedin';

          // Update user's lastLogout timestamp and clear lastLogin
          await prisma.user.update({
            where: { id: decoded.userId },
            data: {
              lastLogin: null, // Clear last login to force re-authentication
              lastLogout: new Date() // Track logout time
            }
          }).catch(() => {}); // Ignore errors, logout should still work
        }
      } catch (e) {
        // Ignore token decode errors
      }
    }

    const response = NextResponse.json({
      message: "Uğurla çıxış edildi",
      timestamp: new Date().toISOString(),
      cleared: true,
      wasLinkedInLogin
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
      "next-auth.csrf-token"
    ];

    // LinkedIn specific cookies to clear
    const linkedinCookies = [
      'li_at', 'JSESSIONID', 'bcookie', 'bscookie', 'li_mc', 'li_sugr',
      'liap', 'li_oatml', 'UserMatchHistory', 'AnalyticsSyncHistory',
      'li_fat_id', 'li_giant', 'li_ep_auth_context'
    ];

    // Clear cookies for multiple paths and domains
    const paths = ["/", "/api", "/auth", "/dashboard"];
    const domains = [undefined, ".cvera.net", "cvera.net"];

    [...cookiesToClear, ...(wasLinkedInLogin ? linkedinCookies : [])].forEach(cookieName => {
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

          if (domain) {
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

    return response;

  } catch (error) {
    console.error('Logout API error:', error);

    // Even on error, return success response with cookie clearing
    const response = NextResponse.json({
      message: "Çıxış edildi (xəta ilə)",
      timestamp: new Date().toISOString()
    });

    // Still clear cookies even on error
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  }
}
