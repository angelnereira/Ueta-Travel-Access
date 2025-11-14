/**
 * Order Service
 * Handles all database operations for orders
 */

import { executeQuery, executeTransaction } from '@/lib/db/oracledb';

interface OrderRow {
  ID: string;
  USER_ID: string;
  TOTAL: number;
  ITEMS_COUNT: number;
  STATUS: string;
  QR_CODE: string;
  TERMINAL: string;
  PICKUP_TIME: Date;
  CREATED_AT: Date;
  // Customer information
  CUSTOMER_NAME: string;
  CUSTOMER_EMAIL: string;
  CUSTOMER_PHONE: string;
  CUSTOMER_PASSPORT: string;
  CUSTOMER_NATIONALITY: string;
  // Flight information
  FLIGHT_NUMBER: string;
  FLIGHT_DATE: Date;
  DEPARTURE_AIRPORT: string;
  ARRIVAL_AIRPORT: string;
  // Payment and discount
  SUBTOTAL: number;
  TAX_AMOUNT: number;
  DISCOUNT_AMOUNT: number;
  COUPON_CODE: string;
  PAYMENT_STATUS: string;
  PAYMENT_METHOD: string;
  PAYMENT_METHOD_ID: string;
  // Fulfillment
  PICKUP_LOCATION: string;
  PICKUP_INSTRUCTIONS: string;
  COLLECTED_AT: Date;
  COLLECTED_BY: string;
  NOTES: string;
}

interface OrderItemRow {
  ID: string;
  ORDER_ID: string;
  PRODUCT_ID: string;
  QUANTITY: number;
  PRICE: number;
  DISCOUNT_APPLIED: number;
  SUBTOTAL: number;
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  itemsCount: number;
  status: 'pending' | 'ready' | 'completed' | 'cancelled';
  qrCode: string;
  terminal: string;
  pickupTime?: Date;
  createdAt: Date;
  items?: OrderItem[];
  // Customer information
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPassport?: string;
  customerNationality?: string;
  // Flight information
  flightNumber?: string;
  flightDate?: Date;
  departureAirport?: string;
  arrivalAirport?: string;
  // Payment and discount
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  couponCode?: string;
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  // Fulfillment
  pickupLocation?: string;
  pickupInstructions?: string;
  collectedAt?: Date;
  collectedBy?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  discountApplied: number;
  subtotal: number;
}

export class OrderService {
  /**
   * Create a new order
   */
  static async create(data: {
    userId: string;
    items: { productId: string; quantity: number; price: number; discount?: number }[];
    terminal: string;
    paymentMethodId?: string;
    // Customer information
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerPassport?: string;
    customerNationality?: string;
    // Flight information
    flightNumber?: string;
    flightDate?: Date;
    departureAirport?: string;
    arrivalAirport?: string;
    // Payment and discount
    couponCode?: string;
    paymentMethod?: string;
    // Fulfillment
    pickupLocation?: string;
    pickupInstructions?: string;
    notes?: string;
  }): Promise<Order> {
    const orderId = `order-${Date.now()}`;

    // Calculate order totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = data.items.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
    const taxAmount = (subtotal - discountAmount) * 0.0; // Configure tax rate as needed
    const total = subtotal - discountAmount + taxAmount;
    const itemsCount = data.items.reduce((sum, item) => sum + item.quantity, 0);

    // Generate QR code
    const qrCode = `QR-${orderId}-${Date.now()}`;

    // Create order and items in a transaction
    await executeTransaction([
      {
        sql: `
          INSERT INTO orders (
            id, user_id, total, items_count, status, qr_code, terminal,
            customer_name, customer_email, customer_phone, customer_passport, customer_nationality,
            flight_number, flight_date, departure_airport, arrival_airport,
            subtotal, tax_amount, discount_amount, coupon_code,
            payment_status, payment_method, payment_method_id,
            pickup_location, pickup_instructions, notes
          ) VALUES (
            :orderId, :userId, :total, :itemsCount, 'pending', :qrCode, :terminal,
            :customerName, :customerEmail, :customerPhone, :customerPassport, :customerNationality,
            :flightNumber, :flightDate, :departureAirport, :arrivalAirport,
            :subtotal, :taxAmount, :discountAmount, :couponCode,
            'pending', :paymentMethod, :paymentMethodId,
            :pickupLocation, :pickupInstructions, :notes
          )
        `,
        binds: {
          orderId,
          userId: data.userId,
          total,
          itemsCount,
          qrCode,
          terminal: data.terminal,
          customerName: data.customerName || null,
          customerEmail: data.customerEmail || null,
          customerPhone: data.customerPhone || null,
          customerPassport: data.customerPassport || null,
          customerNationality: data.customerNationality || null,
          flightNumber: data.flightNumber || null,
          flightDate: data.flightDate || null,
          departureAirport: data.departureAirport || null,
          arrivalAirport: data.arrivalAirport || null,
          subtotal,
          taxAmount,
          discountAmount,
          couponCode: data.couponCode || null,
          paymentMethod: data.paymentMethod || null,
          paymentMethodId: data.paymentMethodId || null,
          pickupLocation: data.pickupLocation || null,
          pickupInstructions: data.pickupInstructions || null,
          notes: data.notes || null
        }
      },
      ...data.items.map((item, index) => ({
        sql: `
          INSERT INTO order_items (
            id, order_id, product_id, quantity, price, subtotal
          ) VALUES (
            :id, :orderId, :productId, :quantity, :price, :subtotal
          )
        `,
        binds: {
          id: `item-${orderId}-${index}`,
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }
      }))
    ]);

    const order = await this.getById(orderId);
    if (!order) {
      throw new Error('Failed to create order');
    }

    return order;
  }

  /**
   * Get order by ID
   */
  static async getById(orderId: string): Promise<Order | null> {
    const sql = `
      SELECT
        id, user_id, total, items_count, status, qr_code, terminal, pickup_time, created_at,
        customer_name, customer_email, customer_phone, customer_passport, customer_nationality,
        flight_number, flight_date, departure_airport, arrival_airport,
        subtotal, tax_amount, discount_amount, coupon_code,
        payment_status, payment_method, payment_method_id,
        pickup_location, pickup_instructions, collected_at, collected_by, notes
      FROM orders
      WHERE id = :orderId
    `;

    const result = await executeQuery<OrderRow>(sql, { orderId });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Get order items
    const items = await this.getOrderItems(orderId);

    return {
      id: row.ID,
      userId: row.USER_ID,
      total: row.TOTAL,
      itemsCount: row.ITEMS_COUNT,
      status: row.STATUS as any,
      qrCode: row.QR_CODE,
      terminal: row.TERMINAL,
      pickupTime: row.PICKUP_TIME,
      createdAt: row.CREATED_AT,
      items,
      // Customer information
      customerName: row.CUSTOMER_NAME,
      customerEmail: row.CUSTOMER_EMAIL,
      customerPhone: row.CUSTOMER_PHONE,
      customerPassport: row.CUSTOMER_PASSPORT,
      customerNationality: row.CUSTOMER_NATIONALITY,
      // Flight information
      flightNumber: row.FLIGHT_NUMBER,
      flightDate: row.FLIGHT_DATE,
      departureAirport: row.DEPARTURE_AIRPORT,
      arrivalAirport: row.ARRIVAL_AIRPORT,
      // Payment and discount
      subtotal: row.SUBTOTAL,
      taxAmount: row.TAX_AMOUNT,
      discountAmount: row.DISCOUNT_AMOUNT,
      couponCode: row.COUPON_CODE,
      paymentStatus: row.PAYMENT_STATUS as any,
      paymentMethod: row.PAYMENT_METHOD,
      // Fulfillment
      pickupLocation: row.PICKUP_LOCATION,
      pickupInstructions: row.PICKUP_INSTRUCTIONS,
      collectedAt: row.COLLECTED_AT,
      collectedBy: row.COLLECTED_BY,
      notes: row.NOTES
    };
  }

  /**
   * Get orders by user ID
   */
  static async getByUserId(userId: string, limit: number = 20): Promise<Order[]> {
    const sql = `
      SELECT
        id, user_id, total, items_count, status, qr_code,
        terminal, pickup_time, created_at
      FROM orders
      WHERE user_id = :userId
      ORDER BY created_at DESC
      FETCH FIRST :limit ROWS ONLY
    `;

    const result = await executeQuery<OrderRow>(sql, { userId, limit });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map(row => ({
      id: row.ID,
      userId: row.USER_ID,
      total: row.TOTAL,
      itemsCount: row.ITEMS_COUNT,
      status: row.STATUS as any,
      qrCode: row.QR_CODE,
      terminal: row.TERMINAL,
      pickupTime: row.PICKUP_TIME,
      createdAt: row.CREATED_AT
    }));
  }

  /**
   * Get order items
   */
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const sql = `
      SELECT
        id, order_id, product_id, quantity, price, discount_applied, subtotal
      FROM order_items
      WHERE order_id = :orderId
    `;

    const result = await executeQuery<OrderItemRow>(sql, { orderId });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map(row => ({
      id: row.ID,
      orderId: row.ORDER_ID,
      productId: row.PRODUCT_ID,
      quantity: row.QUANTITY,
      price: row.PRICE,
      discountApplied: row.DISCOUNT_APPLIED || 0,
      subtotal: row.SUBTOTAL
    }));
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId: string, status: string): Promise<void> {
    const sql = `
      UPDATE orders
      SET status = :status, updated_at = CURRENT_TIMESTAMP
      WHERE id = :orderId
    `;

    await executeQuery(sql, { orderId, status });
  }

  /**
   * Set pickup time
   */
  static async setPickupTime(orderId: string, pickupTime: Date): Promise<void> {
    const sql = `
      UPDATE orders
      SET pickup_time = :pickupTime, updated_at = CURRENT_TIMESTAMP
      WHERE id = :orderId
    `;

    await executeQuery(sql, { orderId, pickupTime });
  }

  /**
   * Cancel order
   */
  static async cancel(orderId: string): Promise<void> {
    await this.updateStatus(orderId, 'cancelled');
  }
}
