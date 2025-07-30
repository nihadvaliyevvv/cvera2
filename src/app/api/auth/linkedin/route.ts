import { NextRequest, NextResponse } from 'next/server';

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!, // Should be https://cvera.net/api/auth/linkedin/callback
  scope: 'openid profile email', // Updated to use modern LinkedIn API scopes
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromPage = searchParams.get('from'); // Check if coming from registration page

    // Always redirect to LinkedIn authorization with forced re-authentication
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', LINKEDIN_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', LINKEDIN_CONFIG.redirectUri);
    authUrl.searchParams.set('scope', LINKEDIN_CONFIG.scope);
    authUrl.searchParams.set('state', Math.random().toString(36).substring(7));

    // If coming from registration page, force complete re-authentication and account selection
    if (fromPage === 'register') {
      // Force complete logout and account selection
      authUrl.searchParams.set('prompt', 'login consent select_account');
      // Force immediate re-authentication (no SSO)
      authUrl.searchParams.set('max_age', '0');
      // Add additional parameter to prevent any cached authentication
      authUrl.searchParams.set('ui_locales', 'en');
      console.log('Registration page detected - forcing complete LinkedIn re-authentication with account selection');
    } else {
      // For login page, still force login but less aggressive
      authUrl.searchParams.set('prompt', 'login');
    }

    console.log('Redirecting to LinkedIn OAuth');
    console.log('From page:', fromPage || 'not specified');
    console.log('Auth URL:', authUrl.toString());

    // Create response with LinkedIn redirect
    const response = NextResponse.redirect(authUrl.toString());

    // If from registration page, aggressively clear all LinkedIn-related cookies and cache
    if (fromPage === 'register') {
      // Clear all LinkedIn session cookies
      const linkedinCookies = [
        'li_at', 'JSESSIONID', 'bcookie', 'bscookie', 'li_mc', 'li_sugr',
        'liap', 'li_oatml', 'UserMatchHistory', 'AnalyticsSyncHistory',
        'li_fat_id', 'li_giant', 'li_ep_auth_context'
      ];

      linkedinCookies.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          domain: '.linkedin.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        });
        // Also clear for main domain
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          domain: 'linkedin.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'none'
        });
      });

      // Clear our own session cookies
      response.cookies.set('token', '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true
      });

      // Add cache control headers to prevent any caching
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      console.log('Aggressive LinkedIn session and cache clearing completed for registration flow');
    }

    return response;

  } catch (error) {
    console.error('LinkedIn OAuth initiation error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=linkedin_init_failed`);
  }
}
