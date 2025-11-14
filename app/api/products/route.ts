import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/oracledb';

// GET /api/products - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    let sql = `
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
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = 1
    `;

    const binds: any = {};

    if (category) {
      sql += ` AND c.slug = :category`;
      binds.category = category;
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = 1`;
    }

    sql += ` ORDER BY p.created_at DESC`;
    sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;

    binds.offset = parseInt(offset);
    binds.limit = parseInt(limit);

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
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
      is_featured
    } = body;

    const sql = `
      INSERT INTO products (
        category_id, name, slug, description, price,
        discount_price, stock_quantity, image_url, images,
        specifications, is_featured
      ) VALUES (
        :category_id, :name, :slug, :description, :price,
        :discount_price, :stock_quantity, :image_url, :images,
        :specifications, :is_featured
      ) RETURNING product_id INTO :product_id
    `;

    const binds = {
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
      product_id: { dir: 3, type: 2002 } // OUT parameter
    };

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: { product_id: result.outBinds?.product_id },
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
