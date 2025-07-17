import { NextRequest, NextResponse } from 'next/server';
import epointService from '@/lib/epoint';

export async function GET(request: NextRequest) {
  try {
    const heartbeatResult = await epointService.checkHeartbeat();

    return NextResponse.json({
      success: heartbeatResult.success,
      status: heartbeatResult.status,
      message: heartbeatResult.message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Heartbeat yoxlanarkən xəta',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
