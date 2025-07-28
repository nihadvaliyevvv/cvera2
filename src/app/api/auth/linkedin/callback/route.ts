import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
  scope: 'openid profile email', // Updated to use modern LinkedIn API scopes
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('LinkedIn callback triggered with code:', code ? 'YES' : 'NO');
    console.log('LinkedIn callback error param:', error);

    // Handle OAuth error
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=linkedin_oauth_failed&details=${error}`);
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=no_code_received`);
    }

    // Exchange code for access token
    console.log('Exchanging code for token...');
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
      return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Access token received:', accessToken ? 'YES' : 'NO');

    // Try multiple LinkedIn API endpoints for better compatibility
    let profileData = null;
    let email = null;
    let firstName = '';
    let lastName = '';
    let linkedinId = '';

    // Try OpenID Connect userinfo endpoint first
    try {
      console.log('Trying OpenID Connect userinfo endpoint...');
      const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (userinfoResponse.ok) {
        const userinfoData = await userinfoResponse.json();
        console.log('OpenID userinfo success:', JSON.stringify(userinfoData, null, 2));

        email = userinfoData.email;
        firstName = userinfoData.given_name || '';
        lastName = userinfoData.family_name || '';
        linkedinId = userinfoData.sub;
      } else {
        console.log('OpenID userinfo failed, trying legacy endpoints...');

        // Fallback to legacy LinkedIn API
        const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          console.log('Legacy profile data:', JSON.stringify(profileData, null, 2));

          firstName = profileData.localizedFirstName || '';
          lastName = profileData.localizedLastName || '';
          linkedinId = profileData.id;

          // Get email separately
          const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            email = emailData.elements?.[0]?.['handle~']?.emailAddress;
          }
        }
      }
    } catch (apiError) {
      console.error('LinkedIn API error:', apiError);
      return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=profile_fetch_failed`);
    }

    console.log('Final extracted data:', { email, firstName, lastName, linkedinId });

    if (!email) {
      console.error('No email found in LinkedIn response');
      return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=no_email_provided`);
    }

    // Database operations
    console.log('Checking user in database...');
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Try to extract LinkedIn username from profile data if available
    let linkedinUsername = null;
    if (profileData && profileData.publicProfileUrl) {
      // Extract username from LinkedIn public profile URL
      const urlMatch = profileData.publicProfileUrl.match(/linkedin\.com\/in\/([^/?]+)/);
      if (urlMatch) {
        linkedinUsername = urlMatch[1];
        console.log('Extracted LinkedIn username:', linkedinUsername);
      }
    }

    if (!user) {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
          linkedinId: linkedinId,
          tier: 'Free', // Matches database schema default
          status: 'active',
          loginMethod: 'linkedin',
        },
      });
      console.log('New user created:', user.id);
    } else {
      console.log('Updating existing user...');
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          linkedinId: linkedinId || user.linkedinId,
          loginMethod: 'linkedin',
          lastLogin: new Date(),
        },
      });
      console.log('User updated:', user.id);
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateJWT({ userId: user.id, email: user.email });

    // Create response with redirect to dashboard
    const response = NextResponse.redirect(`https://cvera.net/dashboard`);

    // Set HTTP-only cookie with improved security settings
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours to match JWT expiration
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.cvera.net' : undefined, // Allow subdomain access in production
    });

    console.log('LinkedIn authentication successful, redirecting to dashboard');
    return response;

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);

    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    if (errorStack) {
      console.error('Error stack:', errorStack);
    }

    return NextResponse.redirect(`https://cvera.net/api/auth/linkedin-error?error=authentication_failed&debug=${encodeURIComponent(errorMessage)}`);
  }
}
