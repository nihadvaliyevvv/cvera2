import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJWT } from "@/lib/jwt";
import FileGenerationService from "@/lib/fileGeneration";
import { CVData } from "@/types/cv";
import { v4 as uuidv4 } from "uuid";
import { canExportFormat, incrementDailyUsage } from "@/lib/subscription-limits";

const prisma = new PrismaClient();

// POST /api/cvs/[id]/download - Initiates the file generation job
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Giriş tələb olunur' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { message: 'Yanlış token' },
        { status: 401 }
      );
    }

    const { format } = await req.json();
    if (!format || !["pdf", "docx"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Use 'pdf' or 'docx'" }, { status: 400 });
    }

    // Check if user can export in this format
    const formatCheck = await canExportFormat(decoded.userId, format as 'pdf' | 'docx');
    if (!formatCheck.allowed) {
      return NextResponse.json({ 
        error: formatCheck.reason,
        errorCode: 'FORMAT_ACCESS_DENIED'
      }, { status: 403 });
    }

    // Verify CV ownership
    const cv = await prisma.cV.findUnique({
      where: { id, userId: decoded.userId },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Create file generation job
    const job = await prisma.fileGenerationJob.create({
      data: {
        id: uuidv4(),
        cvId: id,
        format,
        status: "pending",
      },
    });

    // Generate file
    try {
      const cvData = cv.cv_data as unknown as CVData;
      const fileBuffer = await FileGenerationService.generateFile({
        format: format as 'pdf' | 'docx',
        cvData,
        templateId: cv.templateId || undefined, // Template ID əlavə edildi
      });

      // Update job status to done (without storing the file content)
      await prisma.fileGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'done',
        },
      });

      // Increment daily export count
      await incrementDailyUsage(decoded.userId, format as 'pdf' | 'docx');

      const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const filename = `${cv.title}.${format}`;

      // Convert Buffer to Uint8Array to make it compatible with NextResponse
      const responseBuffer = new Uint8Array(fileBuffer);

      return new NextResponse(responseBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error('File generation error:', error);
      
      // Update job status to failed
      await prisma.fileGenerationJob.update({
        where: { id: job.id },
        data: { status: 'failed' },
      });

      return NextResponse.json(
        { message: 'Fayl yaradılarkən xəta baş verdi' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Download CV error:", error);
    return NextResponse.json(
      { message: 'Daxili server xətası' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/cvs/[id]/download - For future use, currently behaves like POST
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Future implementation for GET if needed

    return NextResponse.json(
      { message: 'GET method not implemented for file download' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Download CV error:', error);
    return NextResponse.json(
      { message: 'Daxili server xətası' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
