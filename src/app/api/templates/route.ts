import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getUserTierAndLimits } from "@/lib/subscription-limits";

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

    // Get user's tier and limits
    const { tier: userTier, limits } = await getUserTierAndLimits(userId);

    // Get all templates
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Add access information to each template
    const templatesWithAccess = templates.map(template => ({
      ...template,
      preview_url: template.previewUrl, // Add preview_url for backward compatibility
      hasAccess: limits.allowedTemplates.includes(template.tier),
      requiresUpgrade: !limits.allowedTemplates.includes(template.tier),
      accessTier: template.tier,
    }));

    return NextResponse.json({
      templates: templatesWithAccess,
      userTier,
      limits: {
        dailyCVLimit: limits.dailyCVLimit,
        allowedTemplates: limits.allowedTemplates,
        exportFormats: limits.exportFormats,
        supportType: limits.supportType,
        allowImages: limits.allowImages,
      }
    });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json({ error: "Şablonlar yüklənərkən xəta baş verdi" }, { status: 500 });
  }
}
