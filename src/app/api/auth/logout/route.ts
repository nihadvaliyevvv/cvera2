import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
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
      ?.split('=')[1] || null;

    const token = headerToken || cookieToken;
    let userId: string | null = null;

    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as any;

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
      }
    }

    const response = NextResponse.json({
      message: "Uğurla hesabdan çıxış edildi",
      timestamp: new Date().toISOString(),
      cleared: true,
      userId: userId || 'naməlum',
      sessionTerminated: true
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
      "jwt-token",
      "sessionToken"
    ];

    // Müxtəlif path və domain-lər üçün cookie-ləri təmizlə
    const paths = ["/", "/api", "/auth", "/dashboard", "/admin"];
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

    console.log('✅ Logout API uğurla tamamlandı');
    return response;

  } catch (error) {
    console.error('Logout API xətası:', error);

    // Xəta olsa belə, cookie-ləri təmizləməyə çalış
    const response = NextResponse.json({
      message: "Çıxış zamanı xəta baş verdi, lakin təmizləndi",
      error: error instanceof Error ? error.message : "Naməlum xəta",
      timestamp: new Date().toISOString(),
      cleared: true
    }, { status: 200 }); // Logout üçün hələ də 200 qaytar

    // Təcili cookie təmizliyi
    const cookiesToClear = ["auth-token", "accessToken", "refreshToken", "session", "token"];
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
