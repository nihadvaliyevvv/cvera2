import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";

const prisma = new PrismaClient();

// GET /api/admin/api-keys - Get all API keys
export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const service = searchParams.get("service") || "linkedin";

    const apiKeys = await prisma.apiKey.findMany({
      where: { service },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      apiKeys: apiKeys.map(key => ({
        ...key,
        key: key.key.substring(0, 20) + "...", // Mask the key for security
      })),
    });
  } catch (error) {
    console.error("Admin API keys fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/api-keys - Create new API key
export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { name, key, service = "linkedin", host, priority = 0 } = await req.json();

    if (!name || !key) {
      return NextResponse.json({ error: "Name and key are required" }, { status: 400 });
    }

    // Check if key already exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { key },
    });

    if (existingKey) {
      return NextResponse.json({ error: "API key already exists" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        service,
        host: host || null,
        priority,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        ...apiKey,
        key: apiKey.key.substring(0, 20) + "...", // Mask the key for security
      },
    });
  } catch (error) {
    console.error("Admin API key creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/api-keys - Update API key
export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id, name, active, priority, host } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;
    if (priority !== undefined) updateData.priority = priority;
    if (host !== undefined) updateData.host = host;

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        ...apiKey,
        key: apiKey.key.substring(0, 20) + "...", // Mask the key for security
      },
    });
  } catch (error) {
    console.error("Admin API key update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/api-keys - Delete API key
export async function DELETE(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "API key deleted successfully" });
  } catch (error) {
    console.error("Admin API key deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
