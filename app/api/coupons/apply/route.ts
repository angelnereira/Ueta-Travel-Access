import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/lib/services/coupon.service';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// POST /api/coupons/apply - Apply coupon to order
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

    const { code, orderId } = await request.json();

    if (!code || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Code and order ID are required' },
        { status: 400 }
      );
    }

    await CouponService.apply(code, userId, orderId);

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error: any) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
