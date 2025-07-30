import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { validateEmail, validatePassword, validateName } from "@/lib/validation";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, name, email, password } = await req.json();

    // Handle both old format (firstName, lastName) and new format (name)
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();

    // Comprehensive validation
    const nameValidation = validateName(fullName);
    if (!nameValidation.isValid) {
      return NextResponse.json({
        message: nameValidation.error
      }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({
        message: emailValidation.error
      }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        message: passwordValidation.error
      }, { status: 400 });
    }

    // Check if user already exists (case-insensitive email check)
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({
        message: "Bu e-poçt ünvanı artıq mövcuddur. Başqa e-poçt ünvanı istifadə edin."
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      message: "Qeydiyyat zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
