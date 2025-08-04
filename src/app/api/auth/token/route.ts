import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Token endpoint called');

    // COMPLETELY DISABLE cookie-based token restoration
    // This was causing auto re-login after logout
    console.log('🚫 Cookie-based token restoration is disabled to prevent auto re-login');

    // Always return 401 - force frontend to only use localStorage tokens
    return NextResponse.json({
      error: 'Cookie-based authentication disabled',
      message: 'Please login again'
    }, { status: 401 });

    /* DISABLED: Cookie-based token restoration
    const referer = request.headers.get('referer');
    const userAgent = request.headers.get('user-agent');

    if (referer?.includes('/auth/login') || referer?.includes('logout=true') || referer?.includes('logged_out=true')) {
      console.log('🚫 Token request from login page or logout context - denying token');
      return NextResponse.json({ error: 'Token tapılmadı - logout context' }, { status: 401 });
    }

    const token = request.cookies.get('token')?.value ||
                  request.cookies.get('auth-token')?.value ||
                  request.cookies.get('accessToken')?.value;

    if (!token) {
      console.log('🚫 No token found in cookies');
      return NextResponse.json({ error: 'Token tapılmadı' }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      console.log('🚫 Invalid token found');
      return NextResponse.json({ error: 'Etibarsız token' }, { status: 401 });
    }

    console.log('✅ Valid token found and returned');

    return NextResponse.json({
      accessToken: token,
      user: payload
    });
    */

  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json({ error: 'Daxili server xətası' }, { status: 500 });
  }
}
