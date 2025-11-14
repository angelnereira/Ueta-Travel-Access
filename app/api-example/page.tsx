/**
 * Example Page using Server-Side Rendering with Real Database Data
 * This demonstrates how to fetch data from Oracle Database on the server
 */

import { ProductService } from '@/lib/services/product.service';
import { CategoryService } from '@/lib/services/category.service';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import Image from 'next/image';
import Link from 'next/link';

// This page uses Server Components and fetches data on the server
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function ApiExamplePage() {
  // Fetch data on the server using services
  const [featuredProducts, categories, allProducts] = await Promise.all([
    cache.getOrSet(
      CacheKeys.featuredProducts(),
      async () => await ProductService.getFeatured(6),
      CacheTTL.medium
    ),
    cache.getOrSet(
      CacheKeys.categories(),
      async () => await CategoryService.getAll(),
      CacheTTL.long
    ),
    cache.getOrSet(
      'products:all:limit:12',
      async () => await ProductService.getAll({ limit: 12 }),
      CacheTTL.medium
    )
  ]);

  // Get cache stats
  const cacheStats = cache.getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Server-Side Rendering Example
          </h1>
          <p className="text-gray-600">
            This page demonstrates SSR with real Oracle Database data
          </p>

          {/* Cache Stats */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Cache Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-600 font-medium">Hit Rate</div>
                <div className="text-2xl font-bold text-blue-900">{cacheStats.hitRate}</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Cache Size</div>
                <div className="text-2xl font-bold text-blue-900">{cacheStats.size}/{cacheStats.maxSize}</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Hits</div>
                <div className="text-2xl font-bold text-green-600">{cacheStats.hits}</div>
              </div>
              <div>
                <div className="text-blue-600 font-medium">Misses</div>
                <div className="text-2xl font-bold text-red-600">{cacheStats.misses}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-semibold text-gray-900">{category.name.en}</div>
                <div className="text-sm text-gray-600">
                  {category.subcategories.length} subcategories
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gray-200">
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name.en}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {product.featured && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      FEATURED
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    {product.name.en}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="block w-full bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Products */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Products</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.name.en}
                              fill
                              className="rounded object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name.en}
                          </div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="text-xs text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ★ {product.rating.toFixed(1)} ({product.reviews})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mt-12 bg-gray-900 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Available API Endpoints</h2>
          <div className="space-y-2 font-mono text-sm">
            <div><span className="text-green-400">GET</span> /api/products</div>
            <div><span className="text-green-400">GET</span> /api/products/[id]</div>
            <div><span className="text-green-400">GET</span> /api/categories</div>
            <div><span className="text-blue-400">POST</span> /api/auth/login</div>
            <div><span className="text-green-400">GET</span> /api/auth/me</div>
            <div><span className="text-blue-400">POST</span> /api/auth/logout</div>
            <div><span className="text-blue-400">POST</span> /api/upload</div>
          </div>
        </section>
      </div>
    </div>
  );
}
