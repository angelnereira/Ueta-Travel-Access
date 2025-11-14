import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, CartItem } from '@/types';

interface OrderState {
  orders: Order[];
  createOrder: (items: CartItem[], total: number) => Order;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (items: CartItem[], total: number) => {
        const orderId = `order-${Date.now()}`;
        const qrCode = JSON.stringify({
          orderId,
          items: items.length,
          total,
          timestamp: new Date().toISOString(),
        });

        const newOrder: Order = {
          id: orderId,
          items,
          total,
          status: 'pending',
          createdAt: new Date().toISOString(),
          qrCode,
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        return newOrder;
      },

      getOrder: (orderId: string) => {
        return get().orders.find((order) => order.id === orderId);
      },

      updateOrderStatus: (orderId: string, status: Order['status']) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'ueta-orders-storage',
    }
  )
);
