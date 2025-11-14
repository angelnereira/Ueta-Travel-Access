import { NextRequest, NextResponse } from 'next/server';
import { QRCodeService } from '@/lib/services/qr-code.service';

// POST /api/qr-codes/validate - Validate QR code
export async function POST(request: NextRequest) {
  try {
    const { qrCode, orderId, scannedBy, scanLocation, terminal, deviceId } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code is required' },
        { status: 400 }
      );
    }

    // Validate QR code
    const validation = await QRCodeService.validateQRCode(qrCode);

    if (!validation.valid) {
      // Record failed scan if orderId provided
      if (orderId) {
        await QRCodeService.recordScan({
          orderId,
          qrCode,
          scannedBy,
          scanLocation,
          terminal,
          deviceId,
          result: validation.reason?.includes('expired') ? 'expired' : 'invalid',
          notes: validation.reason
        });
      }

      return NextResponse.json({
        success: false,
        valid: false,
        reason: validation.reason
      }, { status: 400 });
    }

    // Record successful scan if orderId provided
    if (orderId) {
      await QRCodeService.recordScan({
        orderId,
        qrCode,
        scannedBy,
        scanLocation,
        terminal,
        deviceId,
        result: 'success'
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      data: validation.qr
    });
  } catch (error: any) {
    console.error('Error validating QR code:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
