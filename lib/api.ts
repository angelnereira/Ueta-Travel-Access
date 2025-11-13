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
import type { Product, User, Category } from '@/types';

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
