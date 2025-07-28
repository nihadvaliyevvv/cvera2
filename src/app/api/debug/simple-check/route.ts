import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple environment check
    const config = {
      CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? 'SET' : 'NOT SET',
      CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? 'SET' : 'NOT SET',
      REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };

    return NextResponse.json({
      status: 'LinkedIn config check',
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Config check failed',
      message: error.message
    }, { status: 500 });
  }
}
