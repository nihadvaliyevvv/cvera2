import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!admin || !admin.active) {
      return null;
    }

    return admin;
  } catch (error) {
    return null;
  }
}

// GET - List all API keys
export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');

    const whereClause = service ? { service } : {};

    const apiKeys = await prisma.apiKey.findMany({
      where: whereClause,
      select: {
        id: true,
        service: true,
        active: true,
        priority: true,
        usageCount: true,
        lastUsed: true,
        lastResult: true,
        dailyLimit: true,
        dailyUsage: true,
        lastReset: true,
        createdAt: true,
        updatedAt: true,
        // API key-i security üçün tam göstərmirik
        apiKey: true
      },
      orderBy: [
        { service: 'asc' },
        { priority: 'asc' }
      ]
    });

    // API key-ləri maskeleyaq (security)
    const maskedApiKeys = apiKeys.map(key => ({
      ...key,
      apiKey: key.apiKey.substring(0, 8) + '***' + key.apiKey.slice(-4)
    }));

    return NextResponse.json({
      success: true,
      data: maskedApiKeys,
      total: apiKeys.length
    });

  } catch (error) {
    console.error('API Keys GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service, apiKey, priority = 1, dailyLimit = 1000 } = body;

    // Validation
    if (!service || !apiKey) {
      return NextResponse.json(
        { error: 'Service və API key tələb olunur' },
        { status: 400 }
      );
    }

    // Valid services
    const validServices = ['scrapingdog', 'rapidapi', 'openai', 'linkedin'];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { error: 'Yanlış service adı' },
        { status: 400 }
      );
    }

    // Check if API key already exists
    const existingKey = await prisma.apiKey.findUnique({
      where: {
        service_apiKey: {
          service,
          apiKey
        }
      }
    });

    if (existingKey) {
      return NextResponse.json(
        { error: 'Bu API key artıq mövcuddur' },
        { status: 400 }
      );
    }

    const newApiKey = await prisma.apiKey.create({
      data: {
        service,
        apiKey,
        priority: parseInt(priority),
        dailyLimit: parseInt(dailyLimit),
        active: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...newApiKey,
        apiKey: newApiKey.apiKey.substring(0, 8) + '***' + newApiKey.apiKey.slice(-4)
      },
      message: 'API key uğurla əlavə edildi'
    });

  } catch (error) {
    console.error('API Keys POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update API key
export async function PUT(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, active, priority, dailyLimit } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID tələb olunur' },
        { status: 400 }
      );
    }

    const updatedApiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(active !== undefined && { active: Boolean(active) }),
        ...(priority !== undefined && { priority: parseInt(priority) }),
        ...(dailyLimit !== undefined && { dailyLimit: parseInt(dailyLimit) })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedApiKey,
        apiKey: updatedApiKey.apiKey.substring(0, 8) + '***' + updatedApiKey.apiKey.slice(-4)
      },
      message: 'API key uğurla yeniləndi'
    });

  } catch (error) {
    console.error('API Keys PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID tələb olunur' },
        { status: 400 }
      );
    }

    await prisma.apiKey.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'API key uğurla silindi'
    });

  } catch (error) {
    console.error('API Keys DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
