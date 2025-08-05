import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateJWT, generateRefreshToken, createSessionCookieOptions, createRefreshCookieOptions } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Input validation
    if (!email || !password) {
      return NextResponse.json({
        message: "E-poçt və şifrə tələb olunur"
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        message: "E-poçt formatı yanlışdır"
      }, { status: 400 });
    }
    
    // Normalize email for lookup (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();

    // Find user with subscriptions
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        subscriptions: {
          where: {
            status: 'active'
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        message: "E-poçt və ya şifrə yanlışdır"
      }, { status: 401 });
    }
    
    // Check if user has a password (regular login) or uses LinkedIn login
    if (!user.password) {
      return NextResponse.json({
        message: "Bu hesab LinkedIn ilə qeydiyyatdan keçib. LinkedIn ilə daxil olun.",
        linkedinLogin: true
      }, { status: 400 });
    }

    // Check if email is verified
    if (!user.emailVerified || user.status === "pending_verification") {
      return NextResponse.json({
        message: "E-poçt ünvanınız təsdiqlənməyib. E-poçt qutunuzu yoxlayın və təsdiqləmə linkine basın.",
        requiresVerification: true,
        email: user.email
      }, { status: 403 });
    }

    // Check if account is active
    if (user.status !== "active") {
      return NextResponse.json({
        message: "Hesabınız aktiv deyil. Dəstək komandası ilə əlaqə saxlayın.",
        accountStatus: user.status
      }, { status: 403 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        message: "E-poçt və ya şifrə yanlışdır"
      }, { status: 401 });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginMethod: user.loginMethod || 'email' // Set default login method
      }
    });
    
    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateJWT(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Prepare user data for response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      loginMethod: user.loginMethod || 'email',
      linkedinUsername: user.linkedinUsername,
      linkedinId: user.linkedinId,
      subscriptions: user.subscriptions.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        provider: sub.provider,
        expiresAt: sub.expiresAt.toISOString(),
        startedAt: sub.startedAt.toISOString()
      }))
    };

    const response = NextResponse.json({
      message: "Giriş uğurlu oldu",
      accessToken,
      user: userData
    });
    
    // Set secure cookies
    response.cookies.set("auth-token", accessToken, createSessionCookieOptions());
    response.cookies.set("refreshToken", refreshToken, createRefreshCookieOptions());

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      message: "Giriş zamanı xəta baş verdi"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
