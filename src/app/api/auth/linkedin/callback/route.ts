import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
  scope: 'r_liteprofile r_emailaddress',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=linkedin_oauth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=no_code_received`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CONFIG.clientId,
        client_secret: LINKEDIN_CONFIG.clientSecret,
        redirect_uri: LINKEDIN_CONFIG.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token error:', errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      console.error('Failed to get LinkedIn profile');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=profile_fetch_failed`);
    }

    const profileData = await profileResponse.json();

    // Get user email from LinkedIn
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!emailResponse.ok) {
      console.error('Failed to get LinkedIn email');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=email_fetch_failed`);
    }

    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;

    if (!email) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=no_email_provided`);
    }

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Create user if doesn't exist
    if (!user) {
      const firstName = profileData.localizedFirstName || '';
      const lastName = profileData.localizedLastName || '';

      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`.trim(),
          linkedinId: profileData.id,
          tier: 'FREE',
          status: 'active',
          loginMethod: 'linkedin',
        },
      });
    } else {
      // Update existing user with LinkedIn info if not already set
      if (!user.linkedinId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            linkedinId: profileData.id,
            loginMethod: 'linkedin',
            lastLogin: new Date(),
          },
        });
      } else {
        // Update last login for existing LinkedIn users
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
          },
        });
      }
    }

    // Generate JWT token
    const token = generateJWT({ userId: user.id, email: user.email });

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/dashboard`);

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=authentication_failed`);
  }
}
