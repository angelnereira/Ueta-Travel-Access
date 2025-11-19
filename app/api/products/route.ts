import { NextRequest, NextResponse } from 'next/server';
import util from 'util';
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
      const safeSearch = safeDecycle(products);
      return new Response(JSON.stringify({
        success: true,
        data: safeSearch,
        count: Array.isArray(safeSearch) ? safeSearch.length : 0
      }), { headers: { 'Content-Type': 'application/json' } });
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

    // Reduce to minimal DTOs first (only primitives) to avoid circular refs
    const minimal = (Array.isArray(products) ? products : []).map(p => ({
      id: p.id,
      slug: p.slug,
      name_en: p.name?.en || '',
      price: p.price,
      image: p.image || '',
      category: p.category || '',
      stock: p.stock || 0,
      terminal: p.terminal || ''
    }));

    // Ensure response is plain JSON (avoid circular structures from cached objects)
    const safeProducts = safeDecycle(minimal);

    // DEBUG: inspect a sample product to find circular references
    try {
      if (Array.isArray(safeProducts) && safeProducts.length > 0) {
        console.log('PRODUCT_SAMPLE_TYPE:', typeof safeProducts[0]);
        console.log('PRODUCT_SAMPLE_KEYS:', Object.keys(safeProducts[0]));
        console.log('PRODUCT_SAMPLE_INSPECT:', util.inspect(safeProducts[0], { depth: 4 }));
      } else {
        console.log('PRODUCT_SAMPLE: empty or not array');
      }
    } catch (dbgErr) {
      console.error('DEBUG inspect failed:', dbgErr);
    }

    return new Response(JSON.stringify({
      success: true,
      data: safeProducts,
      count: Array.isArray(safeProducts) ? safeProducts.length : 0,
      cached: cache.get(cacheKey) !== null
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper: convert a value to a pure JSON-safe structure removing cycles
function safeDecycle<T>(value: T): any {
  try {
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(value, function (_key, val) {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return null;
          seen.add(val);
        }
        return val;
      })
    );
  } catch (err) {
    // Fallback: if serialization fails, return an empty array or object
    if (Array.isArray(value)) return [];
    return {};
  }
}
