import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserTierAndLimits, getDailyUsage, getSupportInfo } from '@/lib/subscription-limits';

const JWT_SECRET = process.env.JWT_SECRET || '';

function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's tier and limits
    const { tier, limits } = await getUserTierAndLimits(userId);
    
    // Get today's usage
    const todayUsage = await getDailyUsage(userId);
    
    // Get support info
    const supportInfo = getSupportInfo(tier);

    // Calculate remaining limits
    const remaining = {
      cvCreations: limits.dailyCVLimit === -1 ? 'unlimited' : Math.max(0, limits.dailyCVLimit - todayUsage.cvCreated),
    };

    return NextResponse.json({
      userTier: tier,
      limits: {
        ...limits,
        dailyCVLimit: limits.dailyCVLimit === -1 ? 'unlimited' : limits.dailyCVLimit,
      },
      todayUsage,
      remaining,
      supportInfo,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('User limits API error:', error);
    return NextResponse.json({ 
      error: 'Limitlər yüklənərkən xəta baş verdi',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
