import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();
    
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "Bütün sahələri doldurun." }, { status: 400 });
    }
    
    const name = `${firstName} ${lastName}`;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Bu email artıq istifadə olunur." }, { status: 409 });
    }
    
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || "12"));
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    
    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      email: user.email 
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ message: "Qeydiyyat zamanı xəta baş verdi." }, { status: 500 });
  }
}
