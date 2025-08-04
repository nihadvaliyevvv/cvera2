import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyJWT, blacklistToken, blacklistAllUserTokens, cleanupExpiredTokens } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
<<<<<<< HEAD
    console.log('🚪 Logout API çağırıldı');

    // Token-i header və cookie-dən əldə et
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.replace('Bearer ', '') || null;

    // Cookie-dən də token yoxla
    const cookies = request.headers.get('cookie');
    const cookieToken = cookies?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1] ||
      cookies?.split(';')
      .find(c => c.trim().startsWith('accessToken='))
=======
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
>>>>>>> origin/main
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

<<<<<<< HEAD
        if (decoded?.userId) {
          userId = decoded.userId;
          console.log(`🔓 İstifadəçi çıxır: ${userId}`);

          // İstifadəçi məlumatlarını təmizlə - tam logout üçün
          await prisma.user.update({
            where: { id: decoded.userId },
            data: {
              lastLogin: null, // Yenidən authentication məcburi etmək üçün
            }
          }).catch(error => {
            console.error('User update error:', error);
            // Xəta olsa belə logout davam etsin
          });
        }
      } catch (error) {
        console.error('Token decode error:', error);
        // Token decode xətası olsa belə logout davam etsin
=======
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
>>>>>>> origin/main
      }
    }

    const response = NextResponse.json({
      message: "Uğurla hesabdan çıxış edildi",
      timestamp: new Date().toISOString(),
      cleared: true,
<<<<<<< HEAD
      userId: userId || 'naməlum',
      sessionTerminated: true
=======
      userId: userId || 'unknown'
>>>>>>> origin/main
    });

    // Bütün mümkün authentication cookie-lərini təmizlə
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
<<<<<<< HEAD
      "jwt-token",
      "sessionToken"
    ];

    // Müxtəlif path və domain-lər üçün cookie-ləri təmizlə
    const paths = ["/", "/api", "/auth", "/dashboard", "/admin"];
=======
      "jwt-token"
    ];

    // Clear cookies for multiple paths and domains
    const paths = ["/", "/api", "/auth", "/dashboard"];
>>>>>>> origin/main
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

    // Komprehensiv cache control header-ləri əlavə et
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

<<<<<<< HEAD
    console.log('✅ Logout API uğurla tamamlandı');
    return response;

  } catch (error) {
    console.error('Logout API xətası:', error);
=======
    console.log('✅ Logout completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Logout API error:', error);
>>>>>>> origin/main

    // Xəta olsa belə, cookie-ləri təmizləməyə çalış
    const response = NextResponse.json({
<<<<<<< HEAD
      message: "Çıxış zamanı xəta baş verdi, lakin təmizləndi",
      error: error instanceof Error ? error.message : "Naməlum xəta",
      timestamp: new Date().toISOString(),
      cleared: true
    }, { status: 200 }); // Logout üçün hələ də 200 qaytar

    // Təcili cookie təmizliyi
    const cookiesToClear = ["auth-token", "accessToken", "refreshToken", "session", "token"];
    cookiesToClear.forEach(cookieName => {
=======
      message: "Çıxış edildi",
      timestamp: new Date().toISOString(),
      error: "Xəta baş verdi, lakin çıxış tamamlandı"
    });

    // Still clear cookies even on error
    const essentialCookies = ["auth-token", "accessToken", "refreshToken"];
    essentialCookies.forEach(cookieName => {
>>>>>>> origin/main
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
