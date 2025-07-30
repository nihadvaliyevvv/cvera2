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

    // ALWAYS force complete re-authentication - no exceptions
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', LINKEDIN_CONFIG.clientId);
    authUrl.searchParams.set('redirect_uri', LINKEDIN_CONFIG.redirectUri);
    authUrl.searchParams.set('scope', LINKEDIN_CONFIG.scope);

    // Generate a unique state parameter for security
    authUrl.searchParams.set('state', Math.random().toString(36).substring(7) + Date.now().toString(36));

    // FORCE complete re-authentication for ALL requests
    authUrl.searchParams.set('prompt', 'login consent select_account');
    // Force immediate re-authentication (no SSO cache)
    authUrl.searchParams.set('max_age', '0');
    // Add additional parameters to prevent any cached authentication
    authUrl.searchParams.set('ui_locales', 'en');
    // Add approval_prompt to force consent screen
    authUrl.searchParams.set('approval_prompt', 'force');

    console.log('FORCING complete LinkedIn re-authentication for ALL requests');
    console.log('From page:', fromPage || 'not specified');
    console.log('Auth URL:', authUrl.toString());

    // Create response with LinkedIn redirect
    const response = NextResponse.redirect(authUrl.toString());

    // ALWAYS clear LinkedIn-related cookies and cache (not just for registration)
    const linkedinCookies = [
      'li_at', 'JSESSIONID', 'bcookie', 'bscookie', 'li_mc', 'li_sugr',
      'liap', 'li_oatml', 'UserMatchHistory', 'AnalyticsSyncHistory',
      'li_fat_id', 'li_giant', 'li_ep_auth_context', 'li_rm', 'lidc',
      'lang', 'li_theme', 'li_theme_set', 'visit', 'timezone'
    ];

    // Clear LinkedIn cookies for both domains
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

    // Add aggressive cache control headers to prevent any caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');

    console.log('AGGRESSIVE LinkedIn session and cache clearing completed for ALL requests');

    return response;

  } catch (error) {
    console.error('LinkedIn OAuth initiation error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://cvera.net'}/auth/login?error=linkedin_init_failed`);
  }
}
