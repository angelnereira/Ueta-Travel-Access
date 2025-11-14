'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t, getLocalizedText } from '@/lib/i18n';
import { getFeaturedProducts, getCurrentUser, getCategories, getPromotions } from '@/lib/api';
import type { Product, User, Category, Promotion } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import PromotionBanner from '@/components/ui/PromotionBanner';
import RecentlyViewed from '@/components/ui/RecentlyViewed';

export default function HomePage() {
  const { language } = useLanguageStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, userData, categoriesData, promotionsData] = await Promise.all([
          getFeaturedProducts(),
          getCurrentUser(),
          getCategories(),
          getPromotions(),
        ]);
        setFeaturedProducts(productsData);
        setUser(userData);
        setCategories(categoriesData);
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('home.welcome', language)}, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your premium duty-free shopping experience
        </p>
      </div>

      {/* Flight Info Card */}
      {user?.upcomingFlight && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-ueta-red to-red-600 text-white border-0">
          <h2 className="text-xl font-bold mb-4">{t('home.your_flight', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-red-100 text-sm mb-1">{t('flight.departure', language)}</p>
              <p className="font-bold text-lg">
                {user.upcomingFlight.departure.airport}
              </p>
              <p className="text-sm">
                {t('flight.terminal', language)} {user.upcomingFlight.departure.terminal} •{' '}
                {t('flight.gate', language)} {user.upcomingFlight.departure.gate}
              </p>
            </div>
            <div>
              <p className="text-red-100 text-sm mb-1">{t('flight.arrival', language)}</p>
              <p className="font-bold text-lg">
                {user.upcomingFlight.arrival.airport}
              </p>
              <p className="text-sm">{user.upcomingFlight.arrival.city}</p>
            </div>
            <div>
              <p className="text-red-100 text-sm mb-1">{user.upcomingFlight.flightNumber}</p>
              <p className="font-bold text-lg">
                {t('flight.seat', language)} {user.upcomingFlight.seat}
              </p>
              <p className="text-sm">
                {t('flight.class', language)}: {user.upcomingFlight.class}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Promotions Section */}
      {promotions.length > 0 && (
        <section className="mb-8">
          <div className="space-y-4">
            {promotions.slice(0, 2).map((promo) => (
              <PromotionBanner key={promo.id} promotion={promo} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('home.categories', language)}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop/${category.id}`}>
              <Card
                hover
                className="p-4 text-center cursor-pointer h-full flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">
                    {category.icon === 'sparkles'
                      ? '✨'
                      : category.icon === 'wine'
                      ? '🍷'
                      : category.icon === 'device'
                      ? '📱'
                      : category.icon === 'candy'
                      ? '🍬'
                      : category.icon === 'heart'
                      ? '💄'
                      : '👜'}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                  {getLocalizedText(category.name, language)}
                </h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('home.featured', language)}
          </h2>
          <Link href="/shop">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Loyalty Section */}
      {user && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-2 border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {t('account.loyalty', language)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('account.loyalty_points', language)}: {user.loyaltyPoints}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {t('account.loyalty_tier', language)}:{' '}
                <span className="capitalize font-medium text-ueta-red">
                  {user.loyaltyTier}
                </span>
              </p>
            </div>
            <Link href="/account">
              <Button variant="primary">
                {t('account.qr_code', language)}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
