import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/lib/services/coupon.service';

// GET /api/coupons - Get active coupons
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userTier = searchParams.get('userTier') || undefined;

    const coupons = await CouponService.getActive(userTier);

    return NextResponse.json({
      success: true,
      data: coupons
    });
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
