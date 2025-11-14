/**
 * Product Service
 * Handles all database operations for products
 */

import { executeQuery } from '@/lib/db/oracledb';
import type { Product } from '@/types';

export interface ProductRow {
  ID: string;
  SLUG: string;
  NAME_EN: string;
  NAME_ES: string;
  DESCRIPTION_EN: string;
  DESCRIPTION_ES: string;
  PRICE: number;
  CURRENCY: string;
  ORIGINAL_PRICE: number;
  DISCOUNT: number;
  CATEGORY_ID: string;
  SUBCATEGORY_ID: string;
  BRAND: string;
  IMAGE: string;
  STOCK: number;
  TERMINAL: string;
  FEATURED: number;
  RATING: number;
  REVIEWS_COUNT: number;
  ACTIVE: number;
}

// Transform database row to Product type
function transformProduct(row: ProductRow): Product {
  return {
    id: row.ID,
    slug: row.SLUG,
    name: {
      en: row.NAME_EN,
      es: row.NAME_ES
    },
    description: {
      en: row.DESCRIPTION_EN || '',
      es: row.DESCRIPTION_ES || ''
    },
    price: row.PRICE,
    currency: row.CURRENCY || 'USD',
    originalPrice: row.ORIGINAL_PRICE,
    discount: row.DISCOUNT,
    category: row.CATEGORY_ID,
    subCategory: row.SUBCATEGORY_ID || '',
    brand: row.BRAND || '',
    image: row.IMAGE || '',
    images: [row.IMAGE || ''], // TODO: Load from product_images table
    stock: row.STOCK,
    terminal: row.TERMINAL || '',
    featured: row.FEATURED === 1,
    rating: row.RATING || 0,
    reviews: row.REVIEWS_COUNT || 0
  };
}

export class ProductService {
  /**
   * Get all products with optional filtering
   */
  static async getAll(filters?: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    terminal?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let sql = `
      SELECT
        id, slug, name_en, name_es, description_en, description_es,
        price, currency, original_price, discount, category_id,
        subcategory_id, brand, image, stock, terminal, featured,
        rating, reviews_count, active
      FROM products
      WHERE active = 1
    `;

    const binds: any = {};

    if (filters?.category) {
      sql += ` AND category_id = :category`;
      binds.category = filters.category;
    }

    if (filters?.subcategory) {
      sql += ` AND subcategory_id = :subcategory`;
      binds.subcategory = filters.subcategory;
    }

    if (filters?.featured !== undefined) {
      sql += ` AND featured = :featured`;
      binds.featured = filters.featured ? 1 : 0;
    }

    if (filters?.terminal) {
      sql += ` AND terminal = :terminal`;
      binds.terminal = filters.terminal;
    }

    sql += ` ORDER BY featured DESC, created_at DESC`;

    if (filters?.limit) {
      sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
      binds.offset = filters.offset || 0;
      binds.limit = filters.limit;
    }

    const result = await executeQuery<ProductRow>(sql, binds);
    return (result.rows || []).map(transformProduct);
  }

  /**
   * Get product by ID
   */
  static async getById(id: string): Promise<Product | null> {
    const sql = `
      SELECT
        id, slug, name_en, name_es, description_en, description_es,
        price, currency, original_price, discount, category_id,
        subcategory_id, brand, image, stock, terminal, featured,
        rating, reviews_count, active
      FROM products
      WHERE id = :id AND active = 1
    `;

    const result = await executeQuery<ProductRow>(sql, { id });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return transformProduct(result.rows[0]);
  }

  /**
   * Get product by slug
   */
  static async getBySlug(slug: string): Promise<Product | null> {
    const sql = `
      SELECT
        id, slug, name_en, name_es, description_en, description_es,
        price, currency, original_price, discount, category_id,
        subcategory_id, brand, image, stock, terminal, featured,
        rating, reviews_count, active
      FROM products
      WHERE slug = :slug AND active = 1
    `;

    const result = await executeQuery<ProductRow>(sql, { slug });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return transformProduct(result.rows[0]);
  }

  /**
   * Get featured products
   */
  static async getFeatured(limit: number = 10): Promise<Product[]> {
    return this.getAll({ featured: true, limit });
  }

  /**
   * Search products
   */
  static async search(query: string, limit: number = 20): Promise<Product[]> {
    const sql = `
      SELECT
        id, slug, name_en, name_es, description_en, description_es,
        price, currency, original_price, discount, category_id,
        subcategory_id, brand, image, stock, terminal, featured,
        rating, reviews_count, active
      FROM products
      WHERE active = 1
        AND (
          LOWER(name_en) LIKE :query
          OR LOWER(name_es) LIKE :query
          OR LOWER(brand) LIKE :query
          OR LOWER(description_en) LIKE :query
          OR LOWER(description_es) LIKE :query
        )
      ORDER BY featured DESC, rating DESC
      FETCH FIRST :limit ROWS ONLY
    `;

    const searchQuery = `%${query.toLowerCase()}%`;
    const result = await executeQuery<ProductRow>(sql, {
      query: searchQuery,
      limit
    });

    return (result.rows || []).map(transformProduct);
  }

  /**
   * Get products by category
   */
  static async getByCategory(
    categoryId: string,
    subcategoryId?: string,
    limit?: number
  ): Promise<Product[]> {
    return this.getAll({
      category: categoryId,
      subcategory: subcategoryId,
      limit
    });
  }

  /**
   * Update product stock
   */
  static async updateStock(productId: string, quantity: number): Promise<void> {
    const sql = `
      UPDATE products
      SET stock = stock - :quantity,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = :productId AND stock >= :quantity
    `;

    await executeQuery(sql, { productId, quantity });
  }

  /**
   * Get product images
   */
  static async getImages(productId: string): Promise<string[]> {
    const sql = `
      SELECT image_url
      FROM product_images
      WHERE product_id = :productId
      ORDER BY display_order
    `;

    const result = await executeQuery<{ IMAGE_URL: string }>(sql, { productId });
    return (result.rows || []).map(row => row.IMAGE_URL);
  }
}
