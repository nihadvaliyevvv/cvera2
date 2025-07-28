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
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=linkedin_oauth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=no_code_received`);
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
      throw new Error('Failed to get LinkedIn access token');
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
      throw new Error('Failed to get LinkedIn profile');
    }

    const profileData = await profileResponse.json();

    // Get email from LinkedIn
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddresses?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    let email = '';
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      if (emailData.elements && emailData.elements.length > 0) {
        email = emailData.elements[0]['handle~'].emailAddress;
      }
    }

    // Extract LinkedIn username from profile
    let linkedinUsername = '';
    if (profileData.vanityName) {
      linkedinUsername = profileData.vanityName;
    } else if (profileData.id) {
      // Fallback to profile ID if vanity name not available
      linkedinUsername = profileData.id;
    }

    // Create or update user in database
    const userName = `${profileData.localizedFirstName || ''} ${profileData.localizedLastName || ''}`.trim();

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: userName,
          email,
          linkedinId: profileData.id,
          linkedinUsername,
          loginMethod: 'linkedin',
          emailVerified: new Date(), // LinkedIn emails are pre-verified
        },
      });
    } else {
      // Update existing user with LinkedIn data
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedinId: profileData.id,
          linkedinUsername,
          loginMethod: 'linkedin',
        },
      });
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
    });

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth?error=linkedin_login_failed`);
  }
}
