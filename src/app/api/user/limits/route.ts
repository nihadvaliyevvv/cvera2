import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
// Direct import path instead of alias
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client directly in this file
const prisma = new PrismaClient();

// Simple JWT verification function
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') ||
                  request.cookies.get('token')?.value ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Kullanıcının mevcut tier'ini ve limitlerini al
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        tier: true,
        _count: {
          select: { cvs: true }
        },
        subscriptions: {
          where: {
            status: 'active'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        dailyUsage: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Plan bazında limitler
    const tierLimits = {
      Free: {
        cvCount: 2, // Ümumi limit - 2 CV
        templatesAccess: ['Free'],
        dailyLimit: -1, // Günlük limit yox, ümumi limit
        aiFeatures: false,
        limitType: 'total' // Ümumi limit göstərir
      },
      Medium: {
        cvCount: -1, // Günlük limitə görə limitsiz ümumi
        templatesAccess: ['Free', 'Medium'],
        dailyLimit: 5, // Günlük 5 CV
        aiFeatures: true,
        limitType: 'daily' // Günlük limit
      },
      Premium: {
        cvCount: -1, // Limitsiz
        templatesAccess: ['Free', 'Medium', 'Premium'],
        dailyLimit: -1, // Limitsiz
        aiFeatures: true,
        limitType: 'unlimited' // Limitsiz
      }
    };

    const userTier = user.tier || 'Free';
    const limits = tierLimits[userTier as keyof typeof tierLimits] || tierLimits.Free;

    // Günlük kullanım hesapla (Medium plan üçün)
    const todayUsage = user.dailyUsage.reduce((total, usage) => total + (usage.cvCreated + usage.pdfExports + usage.docxExports), 0);

    // Limit yoxlaması
    let hasReachedLimit = false;
    let remainingLimit = 0;

    if (userTier === 'Free') {
      // Pulsuz plan - ümumi CV sayına bax
      hasReachedLimit = user._count.cvs >= limits.cvCount;
      remainingLimit = Math.max(0, limits.cvCount - user._count.cvs);
    } else if (userTier === 'Medium') {
      // Orta plan - günlük limitə bax
      hasReachedLimit = todayUsage >= limits.dailyLimit;
      remainingLimit = Math.max(0, limits.dailyLimit - todayUsage);
    } else {
      // Premium plan - limitsiz
      hasReachedLimit = false;
      remainingLimit = -1; // Limitsiz
    }

    const result = {
      tier: userTier,
      limits: limits,
      usage: {
        cvCount: user._count.cvs,
        dailyUsage: todayUsage,
        hasReachedLimit: hasReachedLimit,
        remainingLimit: remainingLimit
      },
      subscription: user.subscriptions[0] || null
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('User limits API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
