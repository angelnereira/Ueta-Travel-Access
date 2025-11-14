# Database Setup Guide

## Overview

This document describes the Oracle Autonomous Database setup for Ueta Travel Access PWA.

## Database Information

- **Database Type**: Oracle Autonomous Database 19c Enterprise Edition
- **Connection Mode**: node-oracledb Thin Mode (no Oracle Client required)
- **Authentication**: Wallet-based secure connection
- **Location**: Oracle Cloud Infrastructure - Bogotá Region

## Database Schema

### Tables Created (18 total)

#### Core Product Tables
1. **CATEGORIES** - Product categories (6 records)
2. **SUBCATEGORIES** - Category subdivisions (9 records)
3. **PRODUCTS** - Product catalog (5 sample records)
4. **PRODUCT_IMAGES** - Additional product images

#### User & Account Tables
5. **USERS** - User profiles (1 sample user)
6. **FLIGHT_INFO** - Flight details for travelers
7. **PAYMENT_METHODS** - Saved payment cards
8. **WISHLIST** - User favorite products

#### Transaction Tables
9. **ORDERS** - Customer orders
10. **ORDER_ITEMS** - Line items for each order
11. **REVIEWS** - Product reviews and ratings

#### Marketing Tables
12. **COUPONS** - Discount codes (1 sample: WELCOME20)
13. **COUPON_CATEGORIES** - Many-to-many coupon applicability
14. **PROMOTIONS** - Banner promotions (1 sample: Black Friday)

#### Location Tables
15. **TERMINALS** - Airport terminals (2 records)
16. **TERMINAL_STORES** - Stores within terminals
17. **TERMINAL_STORE_CATEGORIES** - Store inventory
18. **TERMINAL_FEATURES** - Terminal amenities

## Available Scripts

1. **test-db-connection.js** - Verify database connectivity
2. **scripts/execute-ddl.js** - Create all tables
3. **scripts/insert-sample-data.js** - Insert sample data
4. **scripts/verify-schema.js** - Verify schema and data

## Connection Configuration

Pool Settings in lib/db/oracledb.ts:
- Pool Min: 1, Max: 10
- Connection timeout: 60s
- Auto-commit enabled

---
Last Updated: November 14, 2025
