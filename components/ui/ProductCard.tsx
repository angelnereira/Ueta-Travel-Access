'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { getLocalizedText, t, tr } from '@/lib/i18n';
import type { Product } from '@/types';
import Card from './Card';
import Button from './Button';
import Tooltip from './Tooltip';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguageStore();
  const { addItem } = useCartStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const favorite = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <Card hover className="p-4 h-full flex flex-col">
        {/* Image & Badge */}
        <div className="relative w-full aspect-square mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {/* Placeholder image - in production, use real images */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg
              className="w-20 h-20"
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
          </div>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-ueta-red text-white px-2 py-1 rounded text-xs font-bold">
              {tr('product.discount', { percent: product.discount }, language)}
            </div>
          )}

          {/* Favorite Button */}
          <Tooltip text={favorite ? 'Remove from favorites' : 'Add to favorites'}>
            <button
              onClick={handleToggleFavorite}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <svg
                className={`w-5 h-5 ${
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
          </Tooltip>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {getLocalizedText(product.name, language)}
          </h3>

          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
            {product.brand}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
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
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock & Terminal */}
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
            <span
              className={`${
                product.stock < 10 ? 'text-orange-600 dark:text-orange-400' : ''
              }`}
            >
              {product.stock > 0
                ? product.stock < 10
                  ? tr('product.low_stock', { count: product.stock }, language)
                  : t('product.in_stock', language)
                : t('product.out_of_stock', language)}
            </span>
            <span>{product.terminal}</span>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="sm"
            fullWidth
            disabled={product.stock === 0}
          >
            {t('common.add_to_cart', language)}
          </Button>
        </div>
      </Card>
    </Link>
  );
}
