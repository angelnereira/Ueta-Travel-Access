'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useViewedProductsStore } from '@/lib/stores/viewed-products-store';
import { t } from '@/lib/i18n';
import ProductCard from './ProductCard';
import Button from './Button';

export default function RecentlyViewed() {
  const { language } = useLanguageStore();
  const { viewedProducts, clearViewed } = useViewedProductsStore();

  if (viewedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('recent.title', language)}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={clearViewed}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {t('recent.clear', language)}
          </button>
          <Link href="/shop">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {viewedProducts.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
