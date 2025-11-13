'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useFavoritesStore } from '@/lib/stores/favorites-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { t, tr } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';

export default function WishlistPage() {
  const { language } = useLanguageStore();
  const { favorites, clearFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();

  const handleAddAllToCart = () => {
    favorites.forEach((product) => {
      addItem(product);
    });
  };

  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-12 text-center">
          <svg
            className="w-24 h-24 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('wishlist.empty', language)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding products you love
          </p>
          <Link href="/shop">
            <Button variant="primary" size="lg">
              {t('cart.continue_shopping', language)}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('wishlist.title', language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tr('wishlist.items', { count: favorites.length }, language)}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={clearFavorites}
          >
            Clear All
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddAllToCart}
          >
            Add All to Cart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
