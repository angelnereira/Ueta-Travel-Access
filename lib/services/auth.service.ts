/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { executeQuery } from '@/lib/db/oracledb';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

interface UserRow {
  ID: string;
  EMAIL: string;
  PASSWORD_HASH?: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE: string;
  LANGUAGE: string;
  LOYALTY_TIER: string;
  LOYALTY_POINTS: number;
}

const SALT_ROUNDS = 10;

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
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Authenticate user by email and password
   */
  static async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    const sql = `
      SELECT
        id, email, password_hash, first_name, last_name, phone,
        language, loyalty_tier, loyalty_points
      FROM users
      WHERE email = :email AND active = 1
    `;

    const result = await executeQuery<UserRow>(sql, { email });

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Verify password if hash exists
    if (user.PASSWORD_HASH) {
      const isValid = await this.verifyPassword(password, user.PASSWORD_HASH);
      if (!isValid) {
        return null;
      }
    }

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
   * Get user by email (without password verification)
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
   * Create new user with password
   */
  static async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    language?: string;
  }): Promise<AuthUser> {
    const userId = `user-${Date.now()}`;
    const passwordHash = await this.hashPassword(data.password);

    const sql = `
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, language,
        loyalty_tier, loyalty_points, active
      ) VALUES (
        :id, :email, :passwordHash, :firstName, :lastName, :phone, :language,
        'bronze', 0, 1
      )
    `;

    await executeQuery(sql, {
      id: userId,
      email: data.email,
      passwordHash,
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
   * Update user password
   */
  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    const passwordHash = await this.hashPassword(newPassword);

    const sql = `
      UPDATE users
      SET password_hash = :passwordHash, updated_at = CURRENT_TIMESTAMP
      WHERE id = :userId
    `;

    await executeQuery(sql, { userId, passwordHash });
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
