import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/oracledb';

// GET /api/products/[id] - Obtener un producto por ID o slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const isNumeric = !isNaN(Number(id));

    const sql = `
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.discount_price,
        p.stock_quantity,
        p.image_url,
        p.images,
        p.specifications,
        p.is_featured,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE ${isNumeric ? 'p.product_id = :id' : 'p.slug = :id'}
        AND p.is_active = 1
    `;

    const result = await executeQuery(sql, { id: isNumeric ? Number(id) : id });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
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

    await executeQuery(sql, binds);

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

    const sql = `
      UPDATE products
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = :product_id
    `;

    await executeQuery(sql, { product_id: Number(id) });

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
