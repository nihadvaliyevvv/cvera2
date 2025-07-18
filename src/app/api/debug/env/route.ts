import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Debug environment variables in production
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    hasEpointPublicKey: !!process.env.EPOINT_PUBLIC_KEY,
    hasEpointPrivateKey: !!process.env.EPOINT_PRIVATE_KEY,
    epointPublicKeyLength: process.env.EPOINT_PUBLIC_KEY?.length || 0,
    epointPrivateKeyLength: process.env.EPOINT_PRIVATE_KEY?.length || 0,
    epointDevelopmentMode: process.env.EPOINT_DEVELOPMENT_MODE,
    hasNextPublicAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
  };

  return NextResponse.json({
    message: 'Environment Variables Check',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
}
