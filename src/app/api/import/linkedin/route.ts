import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "";

function getUserIdFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Temporarily disable auth for testing
  // const userId = getUserIdFromRequest(request);
  // if (!userId) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  const userId = "test-user"; // For testing

  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url || !url.includes('linkedin.com')) {
      return NextResponse.json({ 
        error: "Düzgün LinkedIn URL daxil edin" 
      }, { status: 400 });
    }

    console.log('🚀 LinkedIn import başladı:', url);
    
    // For testing purposes, return mock data instead of calling API
    const mockData = {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        linkedin: url,
        summary: "Experienced software developer with a passion for creating innovative solutions.",
        website: "https://johndoe.dev",
        headline: "Senior Software Developer at Tech Company"
      },
      experience: [
        {
          company: "Tech Company",
          position: "Senior Software Developer",
          startDate: "2020",
          endDate: "",
          current: true,
          description: "Developing and maintaining web applications using modern technologies.",
          jobType: "Full-time",
          skills: "React, Node.js, TypeScript"
        },
        {
          company: "Previous Company",
          position: "Software Developer",
          startDate: "2018",
          endDate: "2020",
          current: false,
          description: "Built scalable web applications and APIs.",
          jobType: "Full-time",
          skills: "JavaScript, Python, SQL"
        }
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "Bachelor's Degree",
          field: "Computer Science",
          startDate: "2014",
          endDate: "2018",
          current: false,
          description: "Studied computer science fundamentals and software engineering.",
          activities: "Programming Club, Tech Society",
          grade: "3.8 GPA"
        }
      ],
      skills: [
        { name: "JavaScript", level: "Advanced" },
        { name: "React", level: "Advanced" },
        { name: "Node.js", level: "Intermediate" },
        { name: "TypeScript", level: "Intermediate" },
        { name: "Python", level: "Intermediate" }
      ],
      languages: [
        { name: "English", proficiency: "Native" },
        { name: "Spanish", proficiency: "Intermediate" }
      ],
      certifications: [
        {
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          date: "2023",
          description: "Certified in AWS development practices"
        }
      ]
    };

    console.log('✅ Mock data qaytarılır');
    
    return NextResponse.json({ 
      success: true, 
      data: mockData,
      message: "LinkedIn profil uğurla import edildi (Mock Data)" 
    });

  } catch (error: any) {
    console.error("💥 LinkedIn import error:", error);
    
    return NextResponse.json({ 
      success: false,
      error: "LinkedIn profil import zamanı xəta baş verdi. URL-nin düzgün olduğunu və profilin public olduğunu yoxlayın." 
    }, { status: 500 });
  }
}