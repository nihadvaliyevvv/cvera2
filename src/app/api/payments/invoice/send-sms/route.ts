import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const invoiceActionSchema = z.object({
  invoiceId: z.string(),
  phoneNumber: z.string().optional(),
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
    const { invoiceId, phoneNumber } = invoiceActionSchema.parse(body);

    if (!phoneNumber) {
      return NextResponse.json(
        { message: 'Telefon nömrəsi tələb olunur' },
        { status: 400 }
      );
    }

    const smsResult = await epointService.sendInvoiceSMS(invoiceId, phoneNumber);

    return NextResponse.json({
      success: smsResult.success,
      message: smsResult.message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Invoice SMS error:', error);
    return NextResponse.json(
      { message: 'Qəbz SMS göndərilərkən xəta' },
      { status: 500 }
    );
  }
}
