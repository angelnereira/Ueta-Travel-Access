import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';

// GET /api/categories - Get all categories with subcategories
export async function GET(request: NextRequest) {
  try {
    const categories = await cache.getOrSet(
      CacheKeys.categories(),
      async () => await CategoryService.getAll(),
      CacheTTL.long
    );

    // Get product counts for each category
    const counts = await CategoryService.getProductCounts();

    // Add product counts to categories
    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      productCount: counts.get(cat.id) || 0
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
      count: categoriesWithCounts.length
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
