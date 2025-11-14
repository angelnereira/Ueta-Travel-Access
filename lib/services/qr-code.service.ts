/**
 * QR Code Service
 * Handles customer QR codes for identification and order pickup
 */

import { executeQuery } from '@/lib/db/oracledb';

interface QRCodeRow {
  ID: string;
  USER_ID: string;
  QR_CODE: string;
  QR_DATA: string;
  TYPE: string;
  PURPOSE: string;
  FLIGHT_ID: string;
  ACTIVE: number;
  EXPIRES_AT: Date;
  CREATED_AT: Date;
  UPDATED_AT: Date;
}

export interface CustomerQRCode {
  id: string;
  userId: string;
  qrCode: string;
  qrData: any;  // Parsed JSON data
  type: 'customer' | 'boarding' | 'loyalty' | 'order';
  purpose?: string;
  flightId?: string;
  active: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCodeData {
  // Customer information
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  passport?: string;
  nationality?: string;
  // Flight information (if applicable)
  flightNumber?: string;
  flightDate?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  // Order information (if applicable)
  orderId?: string;
  orderTotal?: number;
  // Loyalty information (if applicable)
  loyaltyTier?: string;
  loyaltyPoints?: number;
  cardNumber?: string;
  // Metadata
  generatedAt: string;
  validUntil?: string;
}

export class QRCodeService {
  /**
   * Generate a customer QR code
   */
  static async generateCustomerQR(data: {
    userId: string;
    type?: 'customer' | 'boarding' | 'loyalty' | 'order';
    purpose?: string;
    flightId?: string;
    qrData: QRCodeData;
    expiresAt?: Date;
  }): Promise<CustomerQRCode> {
    const qrId = `qr-${Date.now()}`;
    const qrCode = `UETA-${data.type?.toUpperCase() || 'CUSTOMER'}-${qrId}`;
    const qrDataString = JSON.stringify(data.qrData);

    const sql = `
      INSERT INTO customer_qr_codes (
        id, user_id, qr_code, qr_data, type, purpose, flight_id, active, expires_at
      ) VALUES (
        :id, :userId, :qrCode, :qrData, :type, :purpose, :flightId, 1, :expiresAt
      )
    `;

    await executeQuery(sql, {
      id: qrId,
      userId: data.userId,
      qrCode,
      qrData: qrDataString,
      type: data.type || 'customer',
      purpose: data.purpose || null,
      flightId: data.flightId || null,
      expiresAt: data.expiresAt || null
    });

    const qr = await this.getByCode(qrCode);
    if (!qr) {
      throw new Error('Failed to generate QR code');
    }

    return qr;
  }

  /**
   * Get QR code by code string
   */
  static async getByCode(qrCode: string): Promise<CustomerQRCode | null> {
    const sql = `
      SELECT
        id, user_id, qr_code, qr_data, type, purpose,
        flight_id, active, expires_at, created_at, updated_at
      FROM customer_qr_codes
      WHERE qr_code = :qrCode
    `;

    const result = await executeQuery<QRCodeRow>(sql, { qrCode });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.ID,
      userId: row.USER_ID,
      qrCode: row.QR_CODE,
      qrData: JSON.parse(row.QR_DATA),
      type: row.TYPE as any,
      purpose: row.PURPOSE,
      flightId: row.FLIGHT_ID,
      active: row.ACTIVE === 1,
      expiresAt: row.EXPIRES_AT,
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT
    };
  }

  /**
   * Get all QR codes for a user
   */
  static async getByUserId(userId: string, activeOnly: boolean = true): Promise<CustomerQRCode[]> {
    const sql = `
      SELECT
        id, user_id, qr_code, qr_data, type, purpose,
        flight_id, active, expires_at, created_at, updated_at
      FROM customer_qr_codes
      WHERE user_id = :userId
        ${activeOnly ? 'AND active = 1' : ''}
        ${activeOnly ? 'AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)' : ''}
      ORDER BY created_at DESC
    `;

    const result = await executeQuery<QRCodeRow>(sql, { userId });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map(row => ({
      id: row.ID,
      userId: row.USER_ID,
      qrCode: row.QR_CODE,
      qrData: JSON.parse(row.QR_DATA),
      type: row.TYPE as any,
      purpose: row.PURPOSE,
      flightId: row.FLIGHT_ID,
      active: row.ACTIVE === 1,
      expiresAt: row.EXPIRES_AT,
      createdAt: row.CREATED_AT,
      updatedAt: row.UPDATED_AT
    }));
  }

  /**
   * Validate and scan QR code
   */
  static async validateQRCode(qrCode: string): Promise<{
    valid: boolean;
    qr?: CustomerQRCode;
    reason?: string;
  }> {
    const qr = await this.getByCode(qrCode);

    if (!qr) {
      return {
        valid: false,
        reason: 'QR code not found'
      };
    }

    if (!qr.active) {
      return {
        valid: false,
        qr,
        reason: 'QR code has been deactivated'
      };
    }

    if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
      return {
        valid: false,
        qr,
        reason: 'QR code has expired'
      };
    }

    return {
      valid: true,
      qr
    };
  }

  /**
   * Record QR code scan
   */
  static async recordScan(data: {
    orderId: string;
    qrCode: string;
    scannedBy?: string;
    scanLocation?: string;
    terminal?: string;
    deviceId?: string;
    result?: 'success' | 'failed' | 'invalid' | 'expired';
    notes?: string;
  }): Promise<void> {
    const scanId = `scan-${Date.now()}`;

    const sql = `
      INSERT INTO order_qr_scans (
        id, order_id, qr_code, scanned_by, scan_location,
        terminal, device_id, result, notes
      ) VALUES (
        :id, :orderId, :qrCode, :scannedBy, :scanLocation,
        :terminal, :deviceId, :result, :notes
      )
    `;

    await executeQuery(sql, {
      id: scanId,
      orderId: data.orderId,
      qrCode: data.qrCode,
      scannedBy: data.scannedBy || null,
      scanLocation: data.scanLocation || null,
      terminal: data.terminal || null,
      deviceId: data.deviceId || null,
      result: data.result || 'success',
      notes: data.notes || null
    });
  }

  /**
   * Get scan history for an order
   */
  static async getScanHistory(orderId: string): Promise<any[]> {
    const sql = `
      SELECT
        id, order_id, qr_code, scanned_by, scanned_at,
        scan_location, terminal, device_id, result, notes
      FROM order_qr_scans
      WHERE order_id = :orderId
      ORDER BY scanned_at DESC
    `;

    const result = await executeQuery(sql, { orderId });

    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    return result.rows.map((row: any) => ({
      id: row.ID,
      orderId: row.ORDER_ID,
      qrCode: row.QR_CODE,
      scannedBy: row.SCANNED_BY,
      scannedAt: row.SCANNED_AT,
      scanLocation: row.SCAN_LOCATION,
      terminal: row.TERMINAL,
      deviceId: row.DEVICE_ID,
      result: row.RESULT,
      notes: row.NOTES
    }));
  }

  /**
   * Deactivate QR code
   */
  static async deactivate(qrId: string): Promise<void> {
    const sql = `
      UPDATE customer_qr_codes
      SET active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = :qrId
    `;

    await executeQuery(sql, { qrId });
  }

  /**
   * Deactivate all user QR codes
   */
  static async deactivateUserQRCodes(userId: string, type?: string): Promise<void> {
    const sql = `
      UPDATE customer_qr_codes
      SET active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = :userId
        ${type ? 'AND type = :type' : ''}
    `;

    await executeQuery(sql, { userId, type: type || null });
  }

  /**
   * Generate order pickup QR code
   */
  static async generateOrderQR(data: {
    userId: string;
    orderId: string;
    customerName: string;
    orderTotal: number;
    terminal: string;
    flightNumber?: string;
  }): Promise<CustomerQRCode> {
    const qrData: QRCodeData = {
      userId: data.userId,
      customerName: data.customerName,
      orderId: data.orderId,
      orderTotal: data.orderTotal,
      flightNumber: data.flightNumber,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    return this.generateCustomerQR({
      userId: data.userId,
      type: 'order',
      purpose: `Order pickup QR for order ${data.orderId}`,
      qrData,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }
}
