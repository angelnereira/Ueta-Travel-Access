import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coupon } from '@/types';

interface CouponState {
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  usedCoupons: string[]; // Track used coupon codes
  markCouponAsUsed: (code: string) => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      appliedCoupon: null,
      usedCoupons: [],

      applyCoupon: (coupon: Coupon) => {
        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      markCouponAsUsed: (code: string) => {
        set((state) => ({
          usedCoupons: [...state.usedCoupons, code],
          appliedCoupon: null,
        }));
      },
    }),
    {
      name: 'ueta-coupon-storage',
    }
  )
);
