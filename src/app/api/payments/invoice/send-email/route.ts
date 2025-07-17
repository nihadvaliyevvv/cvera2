import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const invoiceActionSchema = z.object({
  invoiceId: z.string(),
  email: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
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

    const body = await request.json();
    const { invoiceId, email } = invoiceActionSchema.parse(body);

    const emailToSend = email || decoded.email;

    const emailResult = await epointService.sendInvoiceEmail(invoiceId, emailToSend);

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Invoice email error:', error);
    return NextResponse.json(
      { message: 'Qəbz email göndərilərkən xəta' },
      { status: 500 }
    );
  }
}
