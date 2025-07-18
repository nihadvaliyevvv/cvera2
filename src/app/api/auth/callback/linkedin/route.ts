import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateJWT } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('LinkedIn authorization error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=LinkedIn%20autorization%20xətası`);
  }

  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=Avtorizasiya%20kodu%20alınmadı`);
  }

  try {
    // Determine the correct redirect URI (same logic as auth route)
    let redirectUri;
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    
    if (process.env.NODE_ENV === 'development' || host?.includes('localhost')) {
      redirectUri = 'http://localhost:3000/api/auth/linkedin/callback';
    } else if (host?.includes('vercel.app')) {
      redirectUri = `${protocol}://${host}/api/auth/linkedin/callback`;
    } else {
      // Use the new callback path
      redirectUri = 'https://cvera.net/api/auth/callback/linkedin';
    }

    console.log('LinkedIn token exchange with redirect_uri:', redirectUri);

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('LinkedIn token exchange failed:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=LinkedIn%20token%20xətası`);
    }

    // Get LinkedIn profile data
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('LinkedIn profile fetch failed:', profileData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=LinkedIn%20profil%20xətası`);
    }

    console.log('LinkedIn profile data:', profileData);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: profileData.email },
    });

    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      
      user = await prisma.user.create({
        data: {
          email: profileData.email,
          name: profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim(),
          password: hashedPassword, // Random password for OAuth users
          linkedinId: profileData.sub,
        },
      });

      console.log('Created new LinkedIn user:', user.id);
    } else {
      // Update existing user with LinkedIn data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedinId: profileData.sub,
          name: profileData.name || user.name,
        },
      });

      console.log('Updated existing user with LinkedIn data:', user.id);
    }

    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });

    // Create response with redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    
    // Set JWT as httpOnly cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=LinkedIn%20OAuth%20xətası`);
  }
}
