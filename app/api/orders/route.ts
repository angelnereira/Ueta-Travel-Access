import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { AuthService } from '@/lib/services/auth.service';
import { QRCodeService } from '@/lib/services/qr-code.service';
import { cookies } from 'next/headers';

// GET /api/orders - Get user's orders
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
    const limit = parseInt(searchParams.get('limit') || '20');

    const orders = await OrderService.getByUserId(userId, limit);

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
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
    const {
      items,
      terminal,
      paymentMethodId,
      customerName,
      customerEmail,
      customerPhone,
      customerPassport,
      customerNationality,
      flightNumber,
      flightDate,
      departureAirport,
      arrivalAirport,
      couponCode,
      paymentMethod,
      pickupLocation,
      pickupInstructions,
      notes
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!terminal) {
      return NextResponse.json(
        { success: false, error: 'Terminal is required' },
        { status: 400 }
      );
    }

    // Create order with all details
    const order = await OrderService.create({
      userId,
      items,
      terminal,
      paymentMethodId,
      customerName,
      customerEmail,
      customerPhone,
      customerPassport,
      customerNationality,
      flightNumber,
      flightDate: flightDate ? new Date(flightDate) : undefined,
      departureAirport,
      arrivalAirport,
      couponCode,
      paymentMethod,
      pickupLocation,
      pickupInstructions,
      notes
    });

    // Generate QR code for order pickup
    let qrCode = null;
    try {
      qrCode = await QRCodeService.generateOrderQR({
        userId,
        orderId: order.id,
        customerName: customerName || 'Customer',
        orderTotal: order.total,
        terminal,
        flightNumber
      });
    } catch (qrError) {
      console.error('Failed to generate QR code:', qrError);
      // Continue even if QR generation fails
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        pickupQRCode: qrCode
      },
      message: 'Order created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
