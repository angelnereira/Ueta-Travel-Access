'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/lib/stores/language-store';
import { useCouponStore } from '@/lib/stores/coupon-store';
import { t } from '@/lib/i18n';
import { validateCoupon } from '@/lib/api';
import Button from './Button';

interface CouponInputProps {
  cartTotal: number;
  categories: string[];
  userTier?: string;
  onCouponApplied?: () => void;
}

export default function CouponInput({
  cartTotal,
  categories,
  userTier,
  onCouponApplied,
}: CouponInputProps) {
  const { language } = useLanguageStore();
  const { appliedCoupon, applyCoupon, removeCoupon } = useCouponStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await validateCoupon(code.toUpperCase(), cartTotal, categories, userTier);

      if (result.valid && result.coupon) {
        applyCoupon(result.coupon);
        setCode('');
        onCouponApplied?.();
      } else {
        setError(result.message || t('coupon.invalid', language));
      }
    } catch (err) {
      setError(t('common.error', language));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setError('');
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {t('coupon.title', language)}
      </h3>

      {appliedCoupon ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold text-green-900 dark:text-green-100">
                  {t('coupon.applied', language)}
                </span>
              </div>
              <p className="text-sm text-green-800 dark:text-green-300">
                {appliedCoupon.code}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 font-medium"
            >
              {t('coupon.remove', language)}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('coupon.code', language)}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ueta-red focus:border-transparent outline-none uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
            <Button
              onClick={handleApply}
              variant="primary"
              size="md"
              isLoading={loading}
              disabled={!code.trim() || loading}
            >
              {t('coupon.apply', language)}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
