import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { getConnection } from '@/lib/db/oracledb';

// GET /api/products/[id] - Get product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Determine if ID is a slug or actual ID
    const isSlug = id.includes('-');

    const cacheKey = isSlug ? CacheKeys.productSlug(id) : CacheKeys.product(id);

    const product = await cache.getOrSet(
      cacheKey,
      async () => {
        return isSlug
          ? await ProductService.getBySlug(id)
          : await ProductService.getById(id);
      },
      CacheTTL.medium
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get product images
    const images = await ProductService.getImages(product.id);
    if (images.length > 0) {
      product.images = images;
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      category_id,
      name,
      slug,
      description,
      price,
      discount_price,
      stock_quantity,
      image_url,
      images,
      specifications,
      is_featured,
      is_active
    } = body;

    const connection = await getConnection();

    const sql = `
      UPDATE products SET
        category_id = :category_id,
        name = :name,
        slug = :slug,
        description = :description,
        price = :price,
        discount_price = :discount_price,
        stock_quantity = :stock_quantity,
        image_url = :image_url,
        images = :images,
        specifications = :specifications,
        is_featured = :is_featured,
        is_active = :is_active,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = :product_id
    `;

    const binds = {
      product_id: Number(id),
      category_id,
      name,
      slug,
      description,
      price,
      discount_price: discount_price || null,
      stock_quantity: stock_quantity || 0,
      image_url: image_url || null,
      images: images ? JSON.stringify(images) : null,
      specifications: specifications ? JSON.stringify(specifications) : null,
      is_featured: is_featured ? 1 : 0,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1
    };

    await connection.execute(sql, binds, { autoCommit: true });
    await connection.close();

    // Invalidate cache
    cache.delete(CacheKeys.product(id));
    cache.delete(CacheKeys.featuredProducts());

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Eliminar un producto (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const connection = await getConnection();

    const sql = `
      UPDATE products
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = :product_id
    `;

    await connection.execute(sql, { product_id: Number(id) }, { autoCommit: true });
    await connection.close();

    // Invalidate cache
    cache.delete(CacheKeys.product(id));
    cache.delete(CacheKeys.featuredProducts());

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
