import { NextRequest, NextResponse } from 'next/server';

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!, // Should be https://cvera.net/api/auth/linkedin/callback
  scope: 'r_liteprofile r_emailaddress',
};

export async function GET(request: NextRequest) {
  try {
    // Always redirect to LinkedIn authorization
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', LINKEDIN_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', LINKEDIN_CONFIG.redirectUri);
    authUrl.searchParams.set('scope', LINKEDIN_CONFIG.scope);
    authUrl.searchParams.set('state', Math.random().toString(36).substring(7));

    console.log('Redirecting to LinkedIn OAuth with URI:', LINKEDIN_CONFIG.redirectUri);

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    console.error('LinkedIn OAuth initiation error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=linkedin_init_failed`);
  }
}
