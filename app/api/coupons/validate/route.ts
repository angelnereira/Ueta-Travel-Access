import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/lib/services/coupon.service';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// POST /api/coupons/validate - Validate coupon code
export async function POST(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { valid } = AuthService.validateSessionToken(sessionToken);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { code, cartTotal, categories, userTier } = await request.json();

    if (!code || cartTotal === undefined || !categories) {
      return NextResponse.json(
        { success: false, error: 'Code, cart total, and categories are required' },
        { status: 400 }
      );
    }

    const validation = await CouponService.validate(
      code,
      cartTotal,
      categories,
      userTier
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.message || 'Invalid coupon' },
        { status: 400 }
      );
    }

    const discount = await CouponService.calculateDiscount(code, cartTotal);

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        discount,
        finalTotal: cartTotal - discount
      }
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
