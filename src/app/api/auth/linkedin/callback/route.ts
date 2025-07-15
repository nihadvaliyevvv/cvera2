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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=linkedin_cancelled`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=linkedin_error`);
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
      throw new Error('Failed to get access token');
    }

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    // Get user email
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;

    if (!email) {
      throw new Error('No email found in LinkedIn profile');
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      user = await prisma.user.create({
        data: {
          name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
          email,
          password: hashedPassword,
          linkedinId: profile.id,
          tier: 'Free',
        },
      });
    } else {
      // Update LinkedIn ID if not set
      if (!user.linkedinId) {
        user = await prisma.user.update({
          where: { email },
          data: { linkedinId: profile.id },
        });
      }
    }

    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });

    // Create response with redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
    
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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/?error=linkedin_failed`);
  } finally {
    await prisma.$disconnect();
  }
}
