import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 });
    }

    // Verify token
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Return token for frontend to store in localStorage
    return NextResponse.json({ 
      accessToken: token,
      user: payload
    });

  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
