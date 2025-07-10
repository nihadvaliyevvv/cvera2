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

// GET /api/templates - List all available templates
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get all templates
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Filter templates based on user's tier
    const tierOrder = { Free: 1, Medium: 2, Premium: 3 };
    const userTierLevel = tierOrder[userTier as keyof typeof tierOrder] || 1;

    const templatesWithAccess = templates.map((template) => {
      const templateTierLevel = tierOrder[template.tier as keyof typeof tierOrder] || 1;
      return {
        ...template,
        preview_url: template.previewUrl, // Add preview_url for backward compatibility
        hasAccess: templateTierLevel <= userTierLevel,
      };
    });

    return NextResponse.json(templatesWithAccess);
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json({ error: "Şablonlar yüklənərkən xəta baş verdi" }, { status: 500 });
  }
}
