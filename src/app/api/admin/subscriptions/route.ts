import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token tapılmadı');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin icazəniz yoxdur');
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || 'all';
    const tier = url.searchParams.get('tier') || 'all';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }

    if (tier !== 'all') {
      where.tier = tier;
    }

    // Get subscriptions with user info
    const subscriptions = await prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get total count for pagination
    const totalSubscriptions = await prisma.subscription.count({ where });
    const totalPages = Math.ceil(totalSubscriptions / limit);

    return NextResponse.json({
      success: true,
      subscriptions,
      totalPages,
      currentPage: page,
      totalSubscriptions
    });

  } catch (error) {
    console.error('Admin subscriptions error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Server xətası'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
