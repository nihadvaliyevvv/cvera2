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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(request);

    const { isActive } = await request.json();
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: isActive ? 'active' : 'inactive',
        updatedAt: new Date()
      }
    });

    // If deactivating user, also deactivate their subscriptions
    if (!isActive) {
      await prisma.subscription.updateMany({
        where: { 
          userId,
          status: 'active'
        },
        data: {
          status: 'suspended',
          updatedAt: new Date()
        }
      });
    } else {
      // If reactivating user, reactivate their subscriptions
      await prisma.subscription.updateMany({
        where: { 
          userId,
          status: 'suspended'
        },
        data: {
          status: 'active',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `İstifadəçi ${isActive ? 'aktivləşdirildi' : 'deaktivləşdirildi'}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Server xətası'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
