'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useViewedProductsStore } from '@/lib/stores/viewed-products-store';
import { t, tr, getLocalizedText } from '@/lib/i18n';
import { getProductBySlug, getReviewsByProduct, getReviewStats, getProductsByCategory } from '@/lib/api';
import type { Product, Review } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ReviewSection from '@/components/ui/ReviewSection';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { addItem } = useCartStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addViewedProduct } = useViewedProductsStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const slug = params?.slug as string;

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);

        if (data) {
          // Add to viewed products
          addViewedProduct(data);

          // Load reviews and related products
          const [reviewsData, statsData, relatedData] = await Promise.all([
            getReviewsByProduct(data.id),
            getReviewStats(data.id),
            getProductsByCategory(data.category),
          ]);

          setReviews(reviewsData);
          setReviewStats(statsData);
          // Filter out current product and limit to 4
          setRelatedProducts(relatedData.filter(p => p.id !== data.id).slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug, addViewedProduct]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ueta-red mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.loading', language)}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Product not found
        </h1>
        <Button onClick={() => router.push('/shop')}>
          {t('cart.continue_shopping', language)}
        </Button>
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    router.push('/cart');
  };

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card className="p-8">
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            {/* Placeholder */}
            <svg
              className="w-32 h-32 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>

            {/* Discount Badge */}
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-ueta-red text-white px-3 py-2 rounded-lg text-sm font-bold">
                {tr('product.discount', { percent: product.discount }, language)}
              </div>
            )}
          </div>
        </Card>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {getLocalizedText(product.name, language)}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {product.brand}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              {product.rating} ({product.reviews}{' '}
              {tr('product.reviews', { count: product.reviews }, language)})
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.originalPrice > product.price && (
              <p className="text-green-600 dark:text-green-400 font-medium">
                You save ${(product.originalPrice - product.price).toFixed(2)} (
                {product.discount}%)
              </p>
            )}
          </div>

          {/* Description */}
          <Card className="p-4 mb-6 bg-gray-50 dark:bg-gray-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {getLocalizedText(product.description, language)}
            </p>
          </Card>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('product.brand', language)}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {product.brand}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('product.terminal', language)}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {product.terminal}
              </p>
            </Card>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <p
              className={`text-sm font-medium ${
                product.stock > 10
                  ? 'text-green-600 dark:text-green-400'
                  : product.stock > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {product.stock > 0
                ? product.stock < 10
                  ? tr('product.low_stock', { count: product.stock }, language)
                  : t('product.in_stock', language)
                : t('product.out_of_stock', language)}
            </p>
          </div>

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-6 py-2 font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              variant="primary"
              size="lg"
              fullWidth
              disabled={product.stock === 0}
            >
              {t('common.add_to_cart', language)}
            </Button>

            <button
              onClick={handleToggleFavorite}
              className="p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg
                className={`w-6 h-6 ${
                  favorite ? 'fill-ueta-red text-ueta-red' : 'text-gray-400'
                }`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && reviewStats && (
        <div className="mt-12">
          <ReviewSection
            reviews={reviews}
            averageRating={reviewStats.averageRating}
            ratingDistribution={reviewStats.ratingDistribution}
          />
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('related.title', language)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
