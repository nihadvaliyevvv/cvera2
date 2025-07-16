import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only for development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? `${process.env.LINKEDIN_CLIENT_ID.substring(0, 8)}...` : 'NOT SET',
    LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI || 'NOT SET',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    generatedRedirectUri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`,
  });
}
