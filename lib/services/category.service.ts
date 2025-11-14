/**
 * Category Service
 * Handles all database operations for categories
 */

import { executeQuery } from '@/lib/db/oracledb';
import type { Category, SubCategory } from '@/types';

interface CategoryRow {
  ID: string;
  NAME_EN: string;
  NAME_ES: string;
  ICON: string;
}

interface SubCategoryRow {
  ID: string;
  CATEGORY_ID: string;
  NAME_EN: string;
  NAME_ES: string;
}

export class CategoryService {
  /**
   * Get all categories with their subcategories
   */
  static async getAll(): Promise<Category[]> {
    const categoriesSQL = `
      SELECT id, name_en, name_es, icon
      FROM categories
      ORDER BY name_en
    `;

    const subcategoriesSQL = `
      SELECT id, category_id, name_en, name_es
      FROM subcategories
      ORDER BY category_id, name_en
    `;

    const [categoriesResult, subcategoriesResult] = await Promise.all([
      executeQuery<CategoryRow>(categoriesSQL),
      executeQuery<SubCategoryRow>(subcategoriesSQL)
    ]);

    const categories = categoriesResult.rows || [];
    const subcategories = subcategoriesResult.rows || [];

    // Group subcategories by category
    const subcategoriesMap = new Map<string, SubCategory[]>();
    subcategories.forEach(sub => {
      if (!subcategoriesMap.has(sub.CATEGORY_ID)) {
        subcategoriesMap.set(sub.CATEGORY_ID, []);
      }
      subcategoriesMap.get(sub.CATEGORY_ID)!.push({
        id: sub.ID,
        name: {
          en: sub.NAME_EN,
          es: sub.NAME_ES
        }
      });
    });

    return categories.map(cat => ({
      id: cat.ID,
      name: {
        en: cat.NAME_EN,
        es: cat.NAME_ES
      },
      icon: cat.ICON,
      subcategories: subcategoriesMap.get(cat.ID) || []
    }));
  }

  /**
   * Get category by ID
   */
  static async getById(id: string): Promise<Category | null> {
    const categorySQL = `
      SELECT id, name_en, name_es, icon
      FROM categories
      WHERE id = :id
    `;

    const subcategoriesSQL = `
      SELECT id, category_id, name_en, name_es
      FROM subcategories
      WHERE category_id = :id
      ORDER BY name_en
    `;

    const [categoryResult, subcategoriesResult] = await Promise.all([
      executeQuery<CategoryRow>(categorySQL, { id }),
      executeQuery<SubCategoryRow>(subcategoriesSQL, { id })
    ]);

    if (!categoryResult.rows || categoryResult.rows.length === 0) {
      return null;
    }

    const cat = categoryResult.rows[0];
    const subs = subcategoriesResult.rows || [];

    return {
      id: cat.ID,
      name: {
        en: cat.NAME_EN,
        es: cat.NAME_ES
      },
      icon: cat.ICON,
      subcategories: subs.map(sub => ({
        id: sub.ID,
        name: {
          en: sub.NAME_EN,
          es: sub.NAME_ES
        }
      }))
    };
  }

  /**
   * Get product count by category
   */
  static async getProductCounts(): Promise<Map<string, number>> {
    const sql = `
      SELECT category_id, COUNT(*) as count
      FROM products
      WHERE active = 1
      GROUP BY category_id
    `;

    const result = await executeQuery<{ CATEGORY_ID: string; COUNT: number }>(sql);
    const counts = new Map<string, number>();

    (result.rows || []).forEach(row => {
      counts.set(row.CATEGORY_ID, row.COUNT);
    });

    return counts;
  }
}
