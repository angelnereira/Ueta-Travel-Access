/**
 * In-Memory Cache Service
 * Simple LRU cache for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private hits: number;
  private misses: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // 5 min default TTL
    // If cache is full, remove oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete keys matching pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Export singleton instance
export const cache = new Cache(200);

// Cache key builders
export const CacheKeys = {
  product: (id: string) => `product:${id}`,
  productSlug: (slug: string) => `product:slug:${slug}`,
  products: (filters: string) => `products:${filters}`,
  featuredProducts: () => `products:featured`,
  category: (id: string) => `category:${id}`,
  categories: () => `categories:all`,
  user: (id: string) => `user:${id}`,
  reviews: (productId: string) => `reviews:${productId}`,
  terminals: () => `terminals:all`,
  coupons: () => `coupons:active`,
  promotions: () => `promotions:active`
};

// Cache TTL values (in milliseconds)
export const CacheTTL = {
  short: 2 * 60 * 1000, // 2 minutes
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
  veryLong: 60 * 60 * 1000 // 1 hour
};
