import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

// GET /api/products/[id]/reviews - Get all reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [reviews, stats] = await Promise.all([
      ReviewService.getByProductId(params.id, limit),
      ReviewService.getStats(params.id)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.totalReviews
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching product reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
