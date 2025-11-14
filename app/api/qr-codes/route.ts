import { NextRequest, NextResponse } from 'next/server';
import { QRCodeService } from '@/lib/services/qr-code.service';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// GET /api/qr-codes - Get user's QR codes
export async function GET(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId, valid } = AuthService.validateSessionToken(sessionToken);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const qrCodes = await QRCodeService.getByUserId(userId, activeOnly);

    return NextResponse.json({
      success: true,
      data: qrCodes
    });
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/qr-codes - Generate new QR code
export async function POST(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId, valid } = AuthService.validateSessionToken(sessionToken);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, purpose, flightId, qrData, expiresAt } = body;

    if (!qrData) {
      return NextResponse.json(
        { success: false, error: 'QR data is required' },
        { status: 400 }
      );
    }

    const qr = await QRCodeService.generateCustomerQR({
      userId,
      type: type || 'customer',
      purpose,
      flightId,
      qrData,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    return NextResponse.json({
      success: true,
      data: qr
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
