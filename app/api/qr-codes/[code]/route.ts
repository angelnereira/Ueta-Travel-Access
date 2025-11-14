import { NextRequest, NextResponse } from 'next/server';
import { QRCodeService } from '@/lib/services/qr-code.service';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// GET /api/qr-codes/[code] - Get QR code by code
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const qr = await QRCodeService.getByCode(params.code);

    if (!qr) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: qr
    });
  } catch (error: any) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/qr-codes/[code] - Deactivate QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
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

    // Get QR code to verify ownership
    const qr = await QRCodeService.getByCode(params.code);

    if (!qr) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (qr.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await QRCodeService.deactivate(qr.id);

    return NextResponse.json({
      success: true,
      message: 'QR code deactivated successfully'
    });
  } catch (error: any) {
    console.error('Error deactivating QR code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
