'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/lib/stores/language-store';
import { getLocalizedText } from '@/lib/i18n';
import type { Promotion } from '@/types';

interface PromotionBannerProps {
  promotion: Promotion;
}

export default function PromotionBanner({ promotion }: PromotionBannerProps) {
  const { language } = useLanguageStore();

  const content = (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-ueta-red to-red-700 text-white p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">
              {getLocalizedText(promotion.title, language)}
            </h3>
            <p className="text-lg sm:text-xl text-red-100 mb-4">
              {getLocalizedText(promotion.subtitle, language)}
            </p>
            {promotion.couponCode && (
              <div className="inline-block bg-white text-ueta-red px-4 py-2 rounded-lg font-mono font-bold text-sm mb-4">
                {promotion.couponCode}
              </div>
            )}
          </div>
          {promotion.cta && (
            <div className="ml-4">
              <div className="inline-flex items-center px-6 py-3 bg-white text-ueta-red rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {getLocalizedText(promotion.cta, language)}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white rounded-full"></div>
      </div>
    </div>
  );

  if (promotion.link) {
    return <Link href={promotion.link}>{content}</Link>;
  }

  return content;
}
