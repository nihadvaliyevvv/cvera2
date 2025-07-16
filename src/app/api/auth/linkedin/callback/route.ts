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
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=Token%20mübadiləsi%20xətası`);
    }

    // Get user profile using OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Profile fetch failed:', profileResponse.status);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=Profil%20məlumatları%20alınmadı`);
    }

    const profile = await profileResponse.json();
    console.log('LinkedIn Profile:', profile);

    // Extract user data from OpenID Connect response
    let email = profile.email;
    const firstName = profile.given_name || '';
    const lastName = profile.family_name || '';
    const linkedinId = profile.sub; // OpenID Connect subject identifier

    // If no email from LinkedIn, generate one
    if (!email) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${linkedinId}@linkedin.cvera.az`;
    }

    // Check if user exists by LinkedIn ID
    let user = await prisma.user.findFirst({
      where: { linkedinId: linkedinId }
    });

    if (!user) {
      // Check if user exists by email
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });

      if (existingUser) {
        // Update existing user with LinkedIn ID
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { linkedinId: linkedinId }
        });
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);

        user = await prisma.user.create({
          data: {
            email,
            name: `${firstName} ${lastName}`.trim() || 'LinkedIn User',
            password: hashedPassword,
            linkedinId: linkedinId,
            tier: 'Free'
          }
        });
      }
    }

    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });

    // Create response with redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?success=LinkedIn%20ilə%20uğurla%20giriş%20edildi`);
    
    // Set cookies
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=LinkedIn%20giriş%20xətası`);
  } finally {
    await prisma.$disconnect();
  }
}
