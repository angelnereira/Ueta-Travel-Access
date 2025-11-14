'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useOrderStore } from '@/lib/stores/order-store';
import { t, tr } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/api';
import type { User } from '@/types';
import Card from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';

function AccountContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const { orders } = useOrderStore();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const orderId = searchParams?.get('orderId');
  const currentOrder = orderId ? orders.find((o) => o.id === orderId) : null;

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (currentOrder) {
      setShowQR(true);
    }
  }, [currentOrder]);

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

  if (!user) {
    return null;
  }

  // Generate loyalty QR code data
  const loyaltyQRData = JSON.stringify({
    userId: user.id,
    loyaltyId: `UETA-${user.loyaltyTier.toUpperCase()}-${user.id}`,
    points: user.loyaltyPoints,
    tier: user.loyaltyTier,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {t('account.title', language)}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {user.firstName} {user.lastName}
      </p>

      {/* Success Message for New Orders */}
      {currentOrder && (
        <Card className="p-6 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Order Reserved Successfully!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300">
                Order #{currentOrder.id} • {currentOrder.items.length} items • $
                {currentOrder.total.toFixed(2)}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                Show your transaction QR code below at checkout to complete your
                purchase.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile & Loyalty */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('account.profile', language)}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.phone}
                </p>
              </div>
            </div>
          </Card>

          {/* Loyalty Card */}
          <Card className="p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900 border-0">
            <h2 className="text-xl font-bold mb-4">
              {t('account.loyalty', language)}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-800 mb-1">
                  {t('account.loyalty_tier', language)}
                </p>
                <p className="text-2xl font-bold capitalize">{user.loyaltyTier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-800 mb-1">
                  {t('account.loyalty_points', language)}
                </p>
                <p className="text-3xl font-bold">{user.loyaltyPoints}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - QR Codes & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction QR (if recent order) */}
          {currentOrder && showQR && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('qr.transaction', language)}
                </h2>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-6 bg-white rounded-lg shadow-lg mb-4 qr-code">
                  <QRCodeSVG
                    value={currentOrder.qrCode}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Present this QR code at the duty-free checkout counter to complete
                  your purchase.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Order: {currentOrder.id}
                </p>
              </div>
            </Card>
          )}

          {/* Loyalty QR Card */}
          <Card className="p-6">
            <Tooltip text={t('tooltip.qr', language)}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('qr.title', language)}
              </h2>
            </Tooltip>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('qr.description', language)}
            </p>

            <div className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-lg shadow-lg mb-4 qr-code">
                <QRCodeSVG
                  value={loyaltyQRData}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Loyalty ID: UETA-{user.loyaltyTier.toUpperCase()}-{user.id}
              </p>
            </div>
          </Card>

          {/* Order History */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('account.orders', language)}
            </h2>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice().reverse().map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-ueta-red transition-colors cursor-pointer"
                    onClick={() => {
                      setShowQR(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()} •{' '}
                          {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No orders yet
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ueta-red mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
