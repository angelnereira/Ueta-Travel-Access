/**
 * Coupon Service
 * Handles all database operations for coupons and discounts
 */

import { executeQuery } from '@/lib/db/oracledb';

interface CouponRow {
  ID: string;
  CODE: string;
  TYPE: string;
  VALUE: number;
  DESCRIPTION_EN: string;
  DESCRIPTION_ES: string;
  MIN_PURCHASE: number;
  MAX_DISCOUNT: number;
  ACTIVE: number;
  EXPIRY_DATE: Date;
  USAGE_LIMIT: number;
  USAGE_COUNT: number;
  LOYALTY_TIER_REQUIRED: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  description: {
    en: string;
    es: string;
  };
  minPurchase: number;
  maxDiscount: number;
  active: boolean;
  expiryDate: Date;
  usageLimit: number;
  usageCount: number;
  loyaltyTierRequired?: string;
  categories?: string[];
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  message?: string;
  discountAmount?: number;
}

export class CouponService {
  /**
   * Get coupon by code
   */
  static async getByCode(code: string): Promise<Coupon | null> {
    const sql = `
      SELECT
        id, code, type, value, description_en, description_es,
        min_purchase, max_discount, active, expiry_date,
        usage_limit, usage_count, loyalty_tier_required
      FROM coupons
      WHERE code = :code
    `;

    const result = await executeQuery<CouponRow>(sql, { code: code.toUpperCase() });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Get applicable categories
    const categoriesSql = `
      SELECT category_id
      FROM coupon_categories
      WHERE coupon_id = :couponId
    `;

    const categoriesResult = await executeQuery<{ CATEGORY_ID: string }>(categoriesSql, {
      couponId: row.ID
    });

    const categories = (categoriesResult.rows || []).map(r => r.CATEGORY_ID);

    return {
      id: row.ID,
      code: row.CODE,
      type: row.TYPE as any,
      value: row.VALUE,
      description: {
        en: row.DESCRIPTION_EN || '',
        es: row.DESCRIPTION_ES || ''
      },
      minPurchase: row.MIN_PURCHASE || 0,
      maxDiscount: row.MAX_DISCOUNT || 0,
      active: row.ACTIVE === 1,
      expiryDate: row.EXPIRY_DATE,
      usageLimit: row.USAGE_LIMIT || 0,
      usageCount: row.USAGE_COUNT || 0,
      loyaltyTierRequired: row.LOYALTY_TIER_REQUIRED || undefined,
      categories
    };
  }

  /**
   * Get all active coupons
   */
  static async getActive(userTier?: string): Promise<Coupon[]> {
    const sql = `
      SELECT
        id, code, type, value, description_en, description_es,
        min_purchase, max_discount, active, expiry_date,
        usage_limit, usage_count, loyalty_tier_required
      FROM coupons
      WHERE active = 1
        AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP)
        AND (loyalty_tier_required IS NULL OR loyalty_tier_required = :userTier OR :userTier IS NULL)
      ORDER BY created_at DESC
    `;

    const result = await executeQuery<CouponRow>(sql, { userTier: userTier || null });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map(row => ({
      id: row.ID,
      code: row.CODE,
      type: row.TYPE as any,
      value: row.VALUE,
      description: {
        en: row.DESCRIPTION_EN || '',
        es: row.DESCRIPTION_ES || ''
      },
      minPurchase: row.MIN_PURCHASE || 0,
      maxDiscount: row.MAX_DISCOUNT || 0,
      active: row.ACTIVE === 1,
      expiryDate: row.EXPIRY_DATE,
      usageLimit: row.USAGE_LIMIT || 0,
      usageCount: row.USAGE_COUNT || 0,
      loyaltyTierRequired: row.LOYALTY_TIER_REQUIRED || undefined
    }));
  }

  /**
   * Validate coupon for a cart
   */
  static async validate(
    code: string,
    cartTotal: number,
    categories: string[],
    userTier?: string
  ): Promise<CouponValidation> {
    const coupon = await this.getByCode(code);

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code'
      };
    }

    if (!coupon.active) {
      return {
        valid: false,
        message: 'This coupon is no longer active'
      };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return {
        valid: false,
        message: 'This coupon has expired'
      };
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return {
        valid: false,
        message: 'This coupon has reached its usage limit'
      };
    }

    if (cartTotal < coupon.minPurchase) {
      return {
        valid: false,
        message: `Minimum purchase of $${coupon.minPurchase.toFixed(2)} required`
      };
    }

    if (coupon.loyaltyTierRequired && coupon.loyaltyTierRequired !== userTier) {
      return {
        valid: false,
        message: `This coupon is only for ${coupon.loyaltyTierRequired} tier members`
      };
    }

    if (coupon.categories && coupon.categories.length > 0) {
      const hasValidCategory = categories.some(cat => coupon.categories!.includes(cat));
      if (!hasValidCategory) {
        return {
          valid: false,
          message: 'This coupon is not valid for items in your cart'
        };
      }
    }

    // Calculate discount
    const discountAmount = this.calculateDiscountFromCoupon(coupon, cartTotal);

    return {
      valid: true,
      coupon,
      discountAmount
    };
  }

  /**
   * Calculate discount amount by coupon code
   */
  static async calculateDiscount(code: string, cartTotal: number): Promise<number> {
    const coupon = await this.getByCode(code);
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    return this.calculateDiscountFromCoupon(coupon, cartTotal);
  }

  /**
   * Calculate discount amount from coupon object
   */
  static calculateDiscountFromCoupon(coupon: Coupon, cartTotal: number): number {
    let discount = 0;

    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'shipping') {
      discount = coupon.maxDiscount;
    }

    // Apply max discount limit
    if (coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    // Don't exceed cart total
    discount = Math.min(discount, cartTotal);

    return discount;
  }

  /**
   * Apply coupon to an order (increment usage count)
   */
  static async apply(code: string, userId: string, orderId: string): Promise<void> {
    const coupon = await this.getByCode(code);
    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    const sql = `
      UPDATE coupons
      SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = :couponId
    `;

    await executeQuery(sql, { couponId: coupon.id });

    // Optionally, you could also record which user used the coupon with which order
    // This would require a coupon_usage table
  }

  /**
   * Create new coupon
   */
  static async create(data: {
    code: string;
    type: string;
    value: number;
    description: { en: string; es: string };
    minPurchase?: number;
    maxDiscount?: number;
    expiryDate?: Date;
    usageLimit?: number;
    loyaltyTierRequired?: string;
    categories?: string[];
  }): Promise<Coupon> {
    const couponId = `coupon-${Date.now()}`;

    const sql = `
      INSERT INTO coupons (
        id, code, type, value, description_en, description_es,
        min_purchase, max_discount, expiry_date, usage_limit,
        loyalty_tier_required, active, usage_count
      ) VALUES (
        :id, :code, :type, :value, :descEn, :descEs,
        :minPurchase, :maxDiscount, :expiryDate, :usageLimit,
        :loyaltyTier, 1, 0
      )
    `;

    await executeQuery(sql, {
      id: couponId,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      descEn: data.description.en,
      descEs: data.description.es,
      minPurchase: data.minPurchase || 0,
      maxDiscount: data.maxDiscount || 0,
      expiryDate: data.expiryDate || null,
      usageLimit: data.usageLimit || null,
      loyaltyTier: data.loyaltyTierRequired || null
    });

    // Add categories if provided
    if (data.categories && data.categories.length > 0) {
      for (const categoryId of data.categories) {
        await executeQuery(
          `INSERT INTO coupon_categories (coupon_id, category_id) VALUES (:couponId, :categoryId)`,
          { couponId, categoryId }
        );
      }
    }

    const coupon = await this.getByCode(data.code);
    if (!coupon) {
      throw new Error('Failed to create coupon');
    }

    return coupon;
  }

  /**
   * Deactivate coupon
   */
  static async deactivate(couponId: string): Promise<void> {
    const sql = `
      UPDATE coupons
      SET active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = :couponId
    `;

    await executeQuery(sql, { couponId });
  }
}
