import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { isValidCVLanguage } from "@/lib/cvLanguage";

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

async function validateTemplateAccess(userId: string, templateId: string): Promise<boolean> {
  if (!templateId) return true; // No template specified

  // Get user's current subscription tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  const userTier = user?.subscriptions[0]?.tier || "Free";

  // Get template's tier
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { tier: true },
  });

  if (!template) return false; // Template not found

  // Check if user has access to this template tier
  const tierOrder = { Free: 1, Medium: 2, Premium: 3 };
  const userTierLevel = tierOrder[userTier as keyof typeof tierOrder] || 1;
  const templateTierLevel = tierOrder[template.tier as keyof typeof tierOrder] || 1;

  return templateTierLevel <= userTierLevel;
}

// GET /api/cvs/[id] - Get a single CV's data
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    console.log('Fetching CV with ID:', id, 'for userId:', userId);
    const cv = await prisma.cV.findUnique({ where: { id, userId } });
    
    if (!cv) {
      console.log('CV not found:', id);
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }
    
    console.log('CV fetched successfully:', {
      id: cv.id,
      title: cv.title,
      hasData: !!cv.cv_data,
      dataKeys: cv.cv_data ? Object.keys(cv.cv_data as Record<string, unknown>) : []
    });
    
    // Validate cv_data structure
    if (!cv.cv_data || typeof cv.cv_data !== 'object') {
      console.error('Invalid cv_data in database:', typeof cv.cv_data);
      return NextResponse.json({ 
        error: "CV data is corrupted",
        details: "cv_data is not a valid object"
      }, { status: 500 });
    }
    
    return NextResponse.json(cv);
  } catch (error) {
    console.error('CV fetch error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to fetch CV", 
        details: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/cvs/[id] - Update CV data
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    console.log('CV update request body for ID:', id, JSON.stringify(body, null, 2));
    
    const { title, cv_data } = body;
    
    if (!title || !cv_data) {
      console.error('Missing required fields for update:', { title: !!title, cv_data: !!cv_data });
      return NextResponse.json({ error: "Title and cv_data required." }, { status: 400 });
    }
    
    // Validate cv_data structure
    if (typeof cv_data !== 'object' || cv_data === null) {
      console.error('Invalid cv_data format for update:', typeof cv_data);
      return NextResponse.json({ error: "cv_data must be an object" }, { status: 400 });
    }

    // Validate and set CV language if specified
    if (cv_data.cvLanguage && !isValidCVLanguage(cv_data.cvLanguage)) {
      console.error('Invalid CV language:', cv_data.cvLanguage);
      return NextResponse.json({ error: "Invalid CV language. Must be 'azerbaijani' or 'english'" }, { status: 400 });
    }
    
    console.log('CV language for update:', cv_data.cvLanguage || 'not specified');
    
    console.log('Updating CV with ID:', id, 'userId:', userId);
    
    // Extract templateId from cv_data for database field
    const templateId = (cv_data as any)?.templateId || null;
    
    // Validate template access
    if (templateId && !(await validateTemplateAccess(userId, templateId))) {
      return NextResponse.json({ 
        error: "Template access denied. Please upgrade your subscription." 
      }, { status: 403 });
    }
    
    const cv = await prisma.cV.update({
      where: { id, userId },
      data: { 
        title, 
        cv_data,
        templateId 
      },
    });
    
    console.log('CV updated successfully:', cv.id);
    return NextResponse.json(cv);
  } catch (error) {
    console.error('CV update error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to update CV", 
        details: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/cvs/[id] - Delete a CV
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if CV exists and belongs to user
    const existingCV = await prisma.cV.findFirst({
      where: { id, userId }
    });

    if (!existingCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    console.log('Deleting CV and related records:', id);

    // Use transaction to ensure all deletions succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Delete FileGenerationJob records first
      await tx.fileGenerationJob.deleteMany({
        where: { cvId: id }
      });

      // Delete the CV
      await tx.cV.delete({ 
        where: { id, userId } 
      });
    });

    console.log('CV deleted successfully:', id);
    return NextResponse.json({ message: "CV deleted successfully" });
    
  } catch (error) {
    console.error('CV deletion error:', error);
    
    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      return NextResponse.json({ 
        error: "Failed to delete CV", 
        details: error.message 
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
