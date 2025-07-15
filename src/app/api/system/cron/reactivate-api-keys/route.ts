import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/system/cron/reactivate-api-keys - Reactivate API keys after 1 month
export async function POST(req: NextRequest) {
  try {
    // Check for valid cron secret to prevent unauthorized access
    const cronSecret = req.headers.get('X-Cron-Secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Running API key reactivation cron job...');

    // Find API keys that have been inactive for 1 month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const keysToReactivate = await prisma.apiKey.findMany({
      where: {
        active: false,
        deactivatedAt: {
          lte: oneMonthAgo
        },
        lastResult: {
          startsWith: 'deactivated_'
        }
      }
    });

    console.log(`Found ${keysToReactivate.length} API keys to reactivate`);

    if (keysToReactivate.length === 0) {
      return NextResponse.json({ 
        message: 'No API keys to reactivate',
        reactivatedCount: 0 
      });
    }

    // Reactivate the keys
    const reactivatedKeys = [];
    for (const apiKey of keysToReactivate) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: {
          active: true,
          lastResult: 'auto_reactivated_after_30_days',
          deactivatedAt: null
        }
      });

      reactivatedKeys.push({
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key.substring(0, 10) + '...',
        deactivatedAt: apiKey.deactivatedAt
      });

      console.log(`✅ Reactivated API key: ${apiKey.name} (${apiKey.key.substring(0, 10)}...)`);
    }

    console.log(`🎉 Successfully reactivated ${reactivatedKeys.length} API keys`);

    return NextResponse.json({
      message: `Successfully reactivated ${reactivatedKeys.length} API keys`,
      reactivatedCount: reactivatedKeys.length,
      reactivatedKeys: reactivatedKeys
    });

  } catch (error) {
    console.error('❌ API key reactivation cron job failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/system/cron/reactivate-api-keys - Check which keys would be reactivated
export async function GET(req: NextRequest) {
  try {
    // Check for valid cron secret to prevent unauthorized access
    const cronSecret = req.headers.get('X-Cron-Secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Checking API keys eligible for reactivation...');

    // Find API keys that have been inactive for 1 month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const keysToReactivate = await prisma.apiKey.findMany({
      where: {
        active: false,
        deactivatedAt: {
          lte: oneMonthAgo
        },
        lastResult: {
          startsWith: 'deactivated_'
        }
      },
      select: {
        id: true,
        name: true,
        key: true,
        deactivatedAt: true,
        lastResult: true,
        usageCount: true
      }
    });

    const keysInfo = keysToReactivate.map(key => ({
      id: key.id,
      name: key.name,
      key: key.key.substring(0, 10) + '...',
      deactivatedAt: key.deactivatedAt,
      lastResult: key.lastResult,
      usageCount: key.usageCount,
      daysSinceDeactivation: key.deactivatedAt ? 
        Math.floor((Date.now() - key.deactivatedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
    }));

    return NextResponse.json({
      eligibleCount: keysToReactivate.length,
      eligibleKeys: keysInfo
    });

  } catch (error) {
    console.error('❌ API key reactivation check failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
