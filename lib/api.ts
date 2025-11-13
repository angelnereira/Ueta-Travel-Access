/**
 * API Abstraction Layer
 *
 * Phase 1: Reads from local JSON files (mock data)
 * Phase 2: Will be updated to fetch from Oracle Cloud backend APIs
 *
 * This abstraction ensures that UI components remain unchanged
 * when transitioning from mock data to real APIs.
 */

import productsData from '@/data/products.json';
import userData from '@/data/user.json';
import categoriesData from '@/data/categories.json';
import reviewsData from '@/data/reviews.json';
import couponsData from '@/data/coupons.json';
import terminalsData from '@/data/terminals.json';
import promotionsData from '@/data/promotions.json';
import type { Product, User, Category, Review, Coupon, Terminal, Promotion } from '@/types';

// Simulate network delay for realistic behavior
const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============ Products API ============

export async function getProducts(): Promise<Product[]> {
  await simulateDelay();
  return productsData as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  await simulateDelay();
  const products = productsData as Product[];
  return products.find((p) => p.id === id) || null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await simulateDelay();
  const products = productsData as Product[];
  return products.find((p) => p.slug === slug) || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await simulateDelay();
  const products = productsData as Product[];
  return products.filter((p) => p.featured);
}

export async function getProductsByCategory(
  category: string,
  subCategory?: string
): Promise<Product[]> {
  await simulateDelay();
  const products = productsData as Product[];

  return products.filter((p) => {
    if (subCategory) {
      return p.category === category && p.subCategory === subCategory;
    }
    return p.category === category;
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  await simulateDelay();
  const products = productsData as Product[];
  const lowerQuery = query.toLowerCase();

  return products.filter((p) =>
    p.name.en.toLowerCase().includes(lowerQuery) ||
    p.name.es.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.description.en.toLowerCase().includes(lowerQuery) ||
    p.description.es.toLowerCase().includes(lowerQuery)
  );
}

// ============ Categories API ============

export async function getCategories(): Promise<Category[]> {
  await simulateDelay();
  return categoriesData as Category[];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await simulateDelay();
  const categories = categoriesData as Category[];
  return categories.find((c) => c.id === id) || null;
}

// ============ User API ============

export async function getCurrentUser(): Promise<User> {
  await simulateDelay();
  return userData as User;
}

export async function updateUserPreferences(
  preferences: Partial<User['preferences']>
): Promise<User> {
  await simulateDelay();
  // In Phase 1, we just return the user with updated preferences
  // In Phase 2, this would make a PATCH request to the backend
  return {
    ...userData,
    preferences: {
      ...userData.preferences,
      ...preferences,
    },
  } as User;
}

// ============ Reviews API ============

export async function getReviews(): Promise<Review[]> {
  await simulateDelay();
  return reviewsData as Review[];
}

export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  await simulateDelay();
  const reviews = reviewsData as Review[];
  return reviews.filter((r) => r.productId === productId);
}

export async function getReviewStats(productId: string): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}> {
  await simulateDelay();
  const reviews = (reviewsData as Review[]).filter((r) => r.productId === productId);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    ratingDistribution[r.rating]++;
  });

  return { averageRating, totalReviews, ratingDistribution };
}

// ============ Coupons API ============

export async function getCoupons(): Promise<Coupon[]> {
  await simulateDelay();
  return (couponsData as Coupon[]).filter((c) => c.active);
}

export async function validateCoupon(
  code: string,
  cartTotal: number,
  categories: string[],
  userTier?: string
): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
  await simulateDelay();
  const coupons = couponsData as Coupon[];
  const coupon = coupons.find((c) => c.code === code && c.active);

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  if (new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (cartTotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of $${coupon.minPurchase} required`,
    };
  }

  if (coupon.loyaltyTierRequired && coupon.loyaltyTierRequired !== userTier) {
    return {
      valid: false,
      message: `This coupon is only for ${coupon.loyaltyTierRequired} members`,
    };
  }

  if (coupon.categories.length > 0) {
    const hasValidCategory = categories.some((cat) => coupon.categories.includes(cat));
    if (!hasValidCategory) {
      return {
        valid: false,
        message: 'Coupon not valid for items in your cart',
      };
    }
  }

  return { valid: true, coupon };
}

export async function calculateDiscount(
  coupon: Coupon,
  cartTotal: number
): Promise<number> {
  await simulateDelay();

  if (coupon.type === 'percentage') {
    const discount = (cartTotal * coupon.value) / 100;
    return Math.min(discount, coupon.maxDiscount);
  } else if (coupon.type === 'fixed') {
    return Math.min(coupon.value, coupon.maxDiscount);
  } else if (coupon.type === 'shipping') {
    return coupon.maxDiscount; // Free shipping amount
  }

  return 0;
}

// ============ Terminals API ============

export async function getTerminals(): Promise<Terminal[]> {
  await simulateDelay();
  return terminalsData as Terminal[];
}

export async function getTerminalByCode(code: string): Promise<Terminal | null> {
  await simulateDelay();
  const terminals = terminalsData as Terminal[];
  return terminals.find((t) => t.code === code) || null;
}

// ============ Promotions API ============

export async function getPromotions(): Promise<Promotion[]> {
  await simulateDelay();
  const promotions = promotionsData as Promotion[];
  const now = new Date();

  return promotions
    .filter((p) => p.active && new Date(p.startDate) <= now && new Date(p.endDate) >= now)
    .sort((a, b) => a.priority - b.priority);
}

export async function getActiveFlashSales(): Promise<Promotion[]> {
  await simulateDelay();
  const promotions = await getPromotions();
  return promotions.filter((p) => p.type === 'flash');
}

// ============ Future Oracle Integration Points ============
// These comments indicate where Phase 2 API calls will be made

/*
 * Phase 2 Implementation Notes:
 *
 * Replace the functions above with actual HTTP calls:
 *
 * export async function getProducts(): Promise<Product[]> {
 *   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
 *   if (!response.ok) throw new Error('Failed to fetch products');
 *   return response.json();
 * }
 *
 * Use OCI API Gateway endpoints:
 * - Products: https://[api-gateway-url]/api/v1/products
 * - Users: https://[api-gateway-url]/api/v1/users
 * - Orders: https://[api-gateway-url]/api/v1/orders
 *
 * Authentication will use Oracle IDCS/IAM:
 * - Add Bearer tokens to headers
 * - Implement token refresh logic
 * - Handle 401/403 responses
 */
