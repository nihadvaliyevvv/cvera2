import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
  const scope = 'r_liteprofile r_emailaddress';
  const state = Math.random().toString(36).substring(2);

  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn client ID not configured' }, { status: 500 });
  }

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  return NextResponse.redirect(linkedInAuthUrl);
}
