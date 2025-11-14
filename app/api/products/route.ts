import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';

// GET /api/products - Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const featured = searchParams.get('featured');
    const terminal = searchParams.get('terminal') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Handle search separately
    if (search) {
      const products = await ProductService.search(search, limit);
      return NextResponse.json({
        success: true,
        data: products,
        count: products.length
      });
    }

    // Build cache key
    const filters = JSON.stringify({
      category,
      subcategory,
      featured: featured === 'true',
      terminal,
      limit,
      offset
    });
    const cacheKey = CacheKeys.products(filters);

    // Try cache first
    const products = await cache.getOrSet(
      cacheKey,
      async () => {
        return await ProductService.getAll({
          category,
          subcategory,
          featured: featured === 'true' ? true : undefined,
          terminal,
          limit,
          offset
        });
      },
      CacheTTL.medium
    );

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      cached: cache.get(cacheKey) !== null
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
