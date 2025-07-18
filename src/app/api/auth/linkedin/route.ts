import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = "78gi6jtz8ue28i";
  
  // Determine the correct redirect URI based on environment
  let redirectUri;
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  
  if (process.env.NODE_ENV === 'development' || host?.includes('localhost')) {
    redirectUri = 'http://localhost:3000/api/auth/linkedin/callback';
  } else if (host?.includes('vercel.app')) {
    redirectUri = `${protocol}://${host}/api/auth/linkedin/callback`;
  } else {
    // Support both callback paths for LinkedIn - use the new one as default
    redirectUri = 'https://cvera.net/api/auth/callback/linkedin';
  }
  
  const scope = 'openid profile email';
  const state = Math.random().toString(36).substring(2);

  console.log('LinkedIn OAuth Config:', {
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'NOT SET',
    redirectUri,
    scope,
    host,
    protocol,
    nodeEnv: process.env.NODE_ENV
  });

  if (!clientId) {
    return NextResponse.json({ error: 'LinkedIn client ID not configured' }, { status: 500 });
  }

  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

  console.log('LinkedIn Auth URL:', linkedInAuthUrl);

  return NextResponse.redirect(linkedInAuthUrl);
}
