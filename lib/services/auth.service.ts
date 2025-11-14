/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { executeQuery } from '@/lib/db/oracledb';
import * as crypto from 'crypto';

interface UserRow {
  ID: string;
  EMAIL: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE: string;
  LANGUAGE: string;
  LOYALTY_TIER: string;
  LOYALTY_POINTS: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  language: string;
  loyaltyTier: string;
  loyaltyPoints: number;
}

export class AuthService {
  /**
   * Authenticate user by email
   * Note: In production, implement proper password hashing with bcrypt
   */
  static async getUserByEmail(email: string): Promise<AuthUser | null> {
    const sql = `
      SELECT
        id, email, first_name, last_name, phone,
        language, loyalty_tier, loyalty_points
      FROM users
      WHERE email = :email AND active = 1
    `;

    const result = await executeQuery<UserRow>(sql, { email });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.ID,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      phone: user.PHONE || '',
      language: user.LANGUAGE,
      loyaltyTier: user.LOYALTY_TIER,
      loyaltyPoints: user.LOYALTY_POINTS
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<AuthUser | null> {
    const sql = `
      SELECT
        id, email, first_name, last_name, phone,
        language, loyalty_tier, loyalty_points
      FROM users
      WHERE id = :id AND active = 1
    `;

    const result = await executeQuery<UserRow>(sql, { id });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.ID,
      email: user.EMAIL,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      phone: user.PHONE || '',
      language: user.LANGUAGE,
      loyaltyTier: user.LOYALTY_TIER,
      loyaltyPoints: user.LOYALTY_POINTS
    };
  }

  /**
   * Create new user
   */
  static async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    language?: string;
  }): Promise<AuthUser> {
    const userId = `user-${Date.now()}`;

    const sql = `
      INSERT INTO users (
        id, email, first_name, last_name, phone, language,
        loyalty_tier, loyalty_points, active
      ) VALUES (
        :id, :email, :firstName, :lastName, :phone, :language,
        'bronze', 0, 1
      )
    `;

    await executeQuery(sql, {
      id: userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      language: data.language || 'en'
    });

    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Generate session token
   */
  static generateSessionToken(userId: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${userId}:${timestamp}:${random}`).toString('base64');
  }

  /**
   * Validate session token
   */
  static validateSessionToken(token: string): { userId: string; valid: boolean } {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, timestamp] = decoded.split(':');

      // Check if token is less than 7 days old
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      return {
        userId,
        valid: tokenAge < maxAge
      };
    } catch {
      return {
        userId: '',
        valid: false
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: {
      language?: string;
      theme?: string;
      notificationsEnabled?: boolean;
      emailUpdatesEnabled?: boolean;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const binds: any = { userId };

    if (preferences.language) {
      updates.push('language = :language');
      binds.language = preferences.language;
    }

    if (preferences.theme) {
      updates.push('theme = :theme');
      binds.theme = preferences.theme;
    }

    if (preferences.notificationsEnabled !== undefined) {
      updates.push('notifications_enabled = :notificationsEnabled');
      binds.notificationsEnabled = preferences.notificationsEnabled ? 1 : 0;
    }

    if (preferences.emailUpdatesEnabled !== undefined) {
      updates.push('email_updates_enabled = :emailUpdatesEnabled');
      binds.emailUpdatesEnabled = preferences.emailUpdatesEnabled ? 1 : 0;
    }

    if (updates.length === 0) {
      return;
    }

    const sql = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = :userId
    `;

    await executeQuery(sql, binds);
  }
}
