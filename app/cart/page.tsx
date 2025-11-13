'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useCartStore } from '@/lib/stores/cart-store';
import { useOrderStore } from '@/lib/stores/order-store';
import { useCouponStore } from '@/lib/stores/coupon-store';
import { getCurrentUser } from '@/lib/api';
import { calculateDiscount } from '@/lib/api';
import { t, tr, getLocalizedText } from '@/lib/i18n';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import CouponInput from '@/components/ui/CouponInput';

export default function CartPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { appliedCoupon, markCouponAsUsed } = useCouponStore();

  const [discount, setDiscount] = useState(0);
  const [userTier, setUserTier] = useState<string>();

  const total = getTotalPrice();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const categories = Array.from(new Set(items.map((item) => item.product.category)));

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setUserTier(user.loyaltyTier);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function calcDiscount() {
      if (appliedCoupon) {
        const discountAmount = await calculateDiscount(appliedCoupon, total);
        setDiscount(discountAmount);
      } else {
        setDiscount(0);
      }
    }
    calcDiscount();
  }, [appliedCoupon, total]);

  const handleCheckout = () => {
    if (items.length === 0) return;

    const finalTotal = total - discount + total * 0.1; // Subtract discount, add tax

    // Create order with QR code
    const order = createOrder(items, finalTotal);

    // Mark coupon as used
    if (appliedCoupon) {
      markCouponAsUsed(appliedCoupon.code);
    }

    // Clear cart
    clearCart();

    // Navigate to account page to show QR
    router.push(`/account?orderId=${order.id}`);
  };

  if (items.length === 0) {
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('cart.empty', language)}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add some products to get started
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
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {t('cart.title', language)}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {tr('cart.items', { count: itemCount }, language)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-12 h-12 text-gray-400"
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

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 hover:text-ueta-red transition-colors">
                      {getLocalizedText(item.product.name, language)}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.product.brand}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t('cart.subtotal', language)}</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t('coupon.discount', language)}</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (10%)</span>
                <span>${((total - discount) * 0.1).toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('cart.total', language)}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${((total - discount) * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Input */}
            <div className="mb-6">
              <CouponInput
                cartTotal={total}
                categories={categories}
                userTier={userTier}
              />
            </div>

            <Tooltip text={t('tooltip.pickup', language)}>
              <Button
                onClick={handleCheckout}
                variant="primary"
                size="lg"
                fullWidth
                className="mb-3"
              >
                {t('common.reserve_now', language)}
              </Button>
            </Tooltip>

            <Link href="/shop">
              <Button variant="outline" size="md" fullWidth>
                {t('cart.continue_shopping', language)}
              </Button>
            </Link>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 {t('tooltip.pickup', language)}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
