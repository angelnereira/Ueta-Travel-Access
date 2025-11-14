/**
 * Review Service
 * Handles all database operations for product reviews
 */

import { executeQuery } from '@/lib/db/oracledb';

interface ReviewRow {
  ID: string;
  PRODUCT_ID: string;
  USER_ID: string;
  RATING: number;
  TITLE_EN: string;
  TITLE_ES: string;
  COMMENT_EN: string;
  COMMENT_ES: string;
  VERIFIED: number;
  HELPFUL_COUNT: number;
  CREATED_AT: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  rating: number;
  title: {
    en: string;
    es: string;
  };
  comment: {
    en: string;
    es: string;
  };
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export class ReviewService {
  /**
   * Create a new review
   */
  static async create(data: {
    productId: string;
    userId: string;
    rating: number;
    title: { en: string; es: string };
    comment: { en: string; es: string };
    verified?: boolean;
  }): Promise<Review> {
    const reviewId = `review-${Date.now()}`;

    const sql = `
      INSERT INTO reviews (
        id, product_id, user_id, rating, title_en, title_es,
        comment_en, comment_es, verified, helpful_count
      ) VALUES (
        :id, :productId, :userId, :rating, :titleEn, :titleEs,
        :commentEn, :commentEs, :verified, 0
      )
    `;

    await executeQuery(sql, {
      id: reviewId,
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      titleEn: data.title.en,
      titleEs: data.title.es,
      commentEn: data.comment.en,
      commentEs: data.comment.es,
      verified: data.verified ? 1 : 0
    });

    // Update product rating
    await this.updateProductRating(data.productId);

    const review = await this.getById(reviewId);
    if (!review) {
      throw new Error('Failed to create review');
    }

    return review;
  }

  /**
   * Get review by ID
   */
  static async getById(reviewId: string): Promise<Review | null> {
    const sql = `
      SELECT
        r.id, r.product_id, r.user_id, r.rating,
        r.title_en, r.title_es, r.comment_en, r.comment_es,
        r.verified, r.helpful_count, r.created_at,
        u.first_name || ' ' || u.last_name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = :reviewId
    `;

    const result = await executeQuery<ReviewRow & { USER_NAME: string }>(sql, { reviewId });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.ID,
      productId: row.PRODUCT_ID,
      userId: row.USER_ID,
      userName: row.USER_NAME,
      rating: row.RATING,
      title: {
        en: row.TITLE_EN || '',
        es: row.TITLE_ES || ''
      },
      comment: {
        en: row.COMMENT_EN || '',
        es: row.COMMENT_ES || ''
      },
      verified: row.VERIFIED === 1,
      helpfulCount: row.HELPFUL_COUNT || 0,
      createdAt: row.CREATED_AT
    };
  }

  /**
   * Get reviews by product ID
   */
  static async getByProductId(productId: string, limit: number = 20): Promise<Review[]> {
    const sql = `
      SELECT
        r.id, r.product_id, r.user_id, r.rating,
        r.title_en, r.title_es, r.comment_en, r.comment_es,
        r.verified, r.helpful_count, r.created_at,
        u.first_name || ' ' || u.last_name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = :productId
      ORDER BY r.created_at DESC
      FETCH FIRST :limit ROWS ONLY
    `;

    const result = await executeQuery<ReviewRow & { USER_NAME: string }>(sql, { productId, limit });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map(row => ({
      id: row.ID,
      productId: row.PRODUCT_ID,
      userId: row.USER_ID,
      userName: row.USER_NAME,
      rating: row.RATING,
      title: {
        en: row.TITLE_EN || '',
        es: row.TITLE_ES || ''
      },
      comment: {
        en: row.COMMENT_EN || '',
        es: row.COMMENT_ES || ''
      },
      verified: row.VERIFIED === 1,
      helpfulCount: row.HELPFUL_COUNT || 0,
      createdAt: row.CREATED_AT
    }));
  }

  /**
   * Get review statistics for a product
   */
  static async getStats(productId: string): Promise<ReviewStats> {
    const sql = `
      SELECT
        AVG(rating) as avg_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1
      FROM reviews
      WHERE product_id = :productId
    `;

    const result = await executeQuery<{
      AVG_RATING: number;
      TOTAL_REVIEWS: number;
      RATING_5: number;
      RATING_4: number;
      RATING_3: number;
      RATING_2: number;
      RATING_1: number;
    }>(sql, { productId });

    if (!result.rows || result.rows.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const row = result.rows[0];

    return {
      averageRating: Number(row.AVG_RATING) || 0,
      totalReviews: Number(row.TOTAL_REVIEWS) || 0,
      distribution: {
        5: Number(row.RATING_5) || 0,
        4: Number(row.RATING_4) || 0,
        3: Number(row.RATING_3) || 0,
        2: Number(row.RATING_2) || 0,
        1: Number(row.RATING_1) || 0
      }
    };
  }

  /**
   * Mark review as helpful
   */
  static async markHelpful(reviewId: string): Promise<void> {
    const sql = `
      UPDATE reviews
      SET helpful_count = helpful_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = :reviewId
    `;

    await executeQuery(sql, { reviewId });
  }

  /**
   * Update product rating based on reviews
   */
  static async updateProductRating(productId: string): Promise<void> {
    const stats = await this.getStats(productId);

    const sql = `
      UPDATE products
      SET rating = :rating, reviews_count = :count, updated_at = CURRENT_TIMESTAMP
      WHERE id = :productId
    `;

    await executeQuery(sql, {
      productId,
      rating: stats.averageRating,
      count: stats.totalReviews
    });
  }

  /**
   * Delete review
   */
  static async delete(reviewId: string): Promise<void> {
    // Get product ID before deleting
    const review = await this.getById(reviewId);

    const sql = `
      DELETE FROM reviews
      WHERE id = :reviewId
    `;

    await executeQuery(sql, { reviewId });

    // Update product rating
    if (review) {
      await this.updateProductRating(review.productId);
    }
  }
}
