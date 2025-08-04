import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest, sanitizeUserData } from "@/lib/auth-utils";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticateRequest(req);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        error: authResult.error || "Giriş tələb olunur"
      }, { status: 401 });
    }

    // Fetch user data with subscriptions
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
      include: {
        subscriptions: {
          where: {
            status: 'active'
          },
          orderBy: {
            startedAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        error: "İstifadəçi tapılmadı"
      }, { status: 404 });
    }

    // Prepare sanitized user data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier || 'Free',
      loginMethod: user.loginMethod || 'email',
      linkedinUsername: user.linkedinUsername,
      linkedinId: user.linkedinId,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      subscriptions: user.subscriptions.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        provider: sub.provider,
        expiresAt: sub.expiresAt.toISOString(),
        startedAt: sub.startedAt.toISOString()
      }))
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({
      error: "İstifadəçi məlumatları alınarkən xəta"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const authResult = authenticateRequest(req);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        error: authResult.error || "Giriş tələb olunur"
      }, { status: 401 });
    }

    const { name } = await req.json();

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length < 1)) {
      return NextResponse.json({
        error: "Ad düzgün deyil"
      }, { status: 400 });
    }

    // Update user data (only name since avatar doesn't exist in schema)
    const updatedUser = await prisma.user.update({
      where: { id: authResult.user.userId },
      data: {
        ...(name && { name: name.trim() })
      },
      include: {
        subscriptions: {
          where: {
            status: 'active'
          }
        }
      }
    });

    // Prepare response data
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      tier: updatedUser.tier || 'Free',
      loginMethod: updatedUser.loginMethod || 'email',
      linkedinUsername: updatedUser.linkedinUsername,
      linkedinId: updatedUser.linkedinId,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
      subscriptions: updatedUser.subscriptions.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        provider: sub.provider,
        expiresAt: sub.expiresAt.toISOString(),
        startedAt: sub.startedAt.toISOString()
      }))
    };

    return NextResponse.json({
      message: "Profil yeniləndi",
      user: userData
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({
      error: "Profil yenilənərkən xəta"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
