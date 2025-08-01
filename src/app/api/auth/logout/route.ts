import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (token) {
      // Try to extract user ID from token for database cleanup
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as any;

        if (decoded?.userId) {
          // Optional: Update user's lastLogout timestamp
          await prisma.user.update({
            where: { id: decoded.userId },
            data: {
              lastLogin: null, // Clear last login to force re-authentication
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
      cleared: true
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

    // Clear cookies for multiple paths and domains
    const paths = ["/", "/api", "/auth", "/dashboard"];
    const domains = [undefined, ".cvera.net", "cvera.net"];

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

    return response;
  }
}
