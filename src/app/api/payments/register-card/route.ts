import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJWT } from '@/lib/auth';
import epointService from '@/lib/epoint';

const cardRegistrationSchema = z.object({
  cardNumber: z.string(),
  expiryMonth: z.string(),
  expiryYear: z.string(),
  cvv: z.string(),
  cardholderName: z.string(),
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
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardRegistrationSchema.parse(body);

    const cardRegistration = await epointService.registerCard({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
      customerEmail: decoded.email
    });

    if (!cardRegistration.success) {
      return NextResponse.json(
        { message: cardRegistration.message || 'Kart qeydiyyatı uğursuz' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      cardToken: cardRegistration.cardToken,
      message: 'Kart uğurla qeydiyyatdan keçdi'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Card registration error:', error);
    return NextResponse.json(
      { message: 'Kart qeydiyyatı zamanı xəta' },
      { status: 500 }
    );
  }
}
