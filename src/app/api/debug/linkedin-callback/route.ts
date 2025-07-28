import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Capture all query parameters
  const allParams: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    allParams[key] = value;
  }

  // Get environment variables
  const config = {
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? 'SET' : 'NOT SET',
    LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  // Check what LinkedIn is sending us
  const debugInfo = {
    timestamp: new Date().toISOString(),
    requestUrl: request.url,
    queryParameters: allParams,
    headers: {
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    },
    environment: config,
    routeExists: {
      callbackRoute: 'Should exist at /api/auth/linkedin/callback',
      authRoute: 'Should exist at /api/auth/linkedin',
    }
  };

  console.log('=== LinkedIn OAuth Debug Info ===');
  console.log(JSON.stringify(debugInfo, null, 2));

  // If we have an error parameter, show what LinkedIn is telling us
  if (allParams.error) {
    console.log('=== LinkedIn OAuth Error Details ===');
    console.log('Error:', allParams.error);
    console.log('Error Description:', allParams.error_description);
    console.log('Error URI:', allParams.error_uri);
  }

  return NextResponse.json({
    message: 'LinkedIn OAuth Debug Information',
    debug: debugInfo,
    instructions: [
      '1. Check if the callback route exists at /api/auth/linkedin/callback',
      '2. Verify LinkedIn Developer Console has the correct redirect URI',
      '3. Check environment variables are loaded correctly',
      '4. Look at the query parameters to see what LinkedIn is sending',
    ]
  });
}
