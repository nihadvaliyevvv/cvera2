import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateJWT, generateRefreshToken } from "@/lib/jwt";
import { validateEmail } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({
        message: emailValidation.error
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({
        message: "Şifrə tələb olunur."
      }, { status: 400 });
    }
    
    // Normalize email for lookup (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json({
        message: "E-poçt və ya şifrə yanlışdır."
      }, { status: 401 });
    }
    
    // Check if user has a password (regular login) or uses LinkedIn login
    if (!user.password) {
      return NextResponse.json({
        message: "Bu hesab LinkedIn ilə qeydiyyatdan keçib. LinkedIn ilə daxil olun.",
        requiresLinkedInLogin: true
      }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({
        message: "E-poçt və ya şifrə yanlışdır."
      }, { status: 401 });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    const accessToken = generateJWT({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
    
    const response = NextResponse.json({ 
      message: "Giriş uğurlu oldu",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tier: user.tier,
        linkedinUsername: user.linkedinUsername
      }
    });
    
    // Set auth-token cookie for consistency with LinkedIn OAuth
    response.cookies.set("auth-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });
    
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: "Giriş zamanı xəta baş verdi." }, { status: 500 });
  }
}
