#!/usr/bin/env node

// Script para ejecutar DDL y DML en Oracle Database
require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

async function executeDDL() {
  let connection;

  console.log('\n=== Ejecutando DDL/DML en Oracle Database ===\n');

  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD
    };

    console.log('📡 Conectando...\n');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conectado exitosamente!\n');

    // Ejecutar DDL de tablas
    console.log('==================== CREANDO TABLAS ====================\n');

    const tables = [
      {
        name: 'categories',
        sql: `CREATE TABLE categories (
          id VARCHAR2(50) PRIMARY KEY,
          name_en VARCHAR2(200) NOT NULL,
          name_es VARCHAR2(200) NOT NULL,
          icon VARCHAR2(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'subcategories',
        sql: `CREATE TABLE subcategories (
          id VARCHAR2(50) PRIMARY KEY,
          category_id VARCHAR2(50) NOT NULL,
          name_en VARCHAR2(200) NOT NULL,
          name_es VARCHAR2(200) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_subcat_category FOREIGN KEY (category_id) REFERENCES categories(id)
        )`
      },
      {
        name: 'products',
        sql: `CREATE TABLE products (
          id VARCHAR2(50) PRIMARY KEY,
          slug VARCHAR2(200) UNIQUE NOT NULL,
          name_en VARCHAR2(500) NOT NULL,
          name_es VARCHAR2(500) NOT NULL,
          description_en CLOB,
          description_es CLOB,
          price NUMBER(10,2) NOT NULL,
          currency VARCHAR2(3) DEFAULT 'USD',
          original_price NUMBER(10,2),
          discount NUMBER(3,0) DEFAULT 0,
          category_id VARCHAR2(50) NOT NULL,
          subcategory_id VARCHAR2(50),
          brand VARCHAR2(200),
          image VARCHAR2(500),
          stock NUMBER(10,0) DEFAULT 0,
          terminal VARCHAR2(10),
          featured NUMBER(1) DEFAULT 0,
          rating NUMBER(2,1) DEFAULT 0,
          reviews_count NUMBER(10,0) DEFAULT 0,
          active NUMBER(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id),
          CONSTRAINT fk_product_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
        )`
      },
      {
        name: 'product_images',
        sql: `CREATE TABLE product_images (
          id VARCHAR2(50) PRIMARY KEY,
          product_id VARCHAR2(50) NOT NULL,
          image_url VARCHAR2(500) NOT NULL,
          display_order NUMBER(3,0) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'users',
        sql: `CREATE TABLE users (
          id VARCHAR2(50) PRIMARY KEY,
          first_name VARCHAR2(100) NOT NULL,
          last_name VARCHAR2(100) NOT NULL,
          email VARCHAR2(200) UNIQUE NOT NULL,
          phone VARCHAR2(50),
          language VARCHAR2(2) DEFAULT 'en',
          currency VARCHAR2(3) DEFAULT 'USD',
          loyalty_tier VARCHAR2(20) DEFAULT 'bronze',
          loyalty_points NUMBER(10,0) DEFAULT 0,
          theme VARCHAR2(10) DEFAULT 'light',
          notifications_enabled NUMBER(1) DEFAULT 1,
          email_updates_enabled NUMBER(1) DEFAULT 1,
          active NUMBER(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'flight_info',
        sql: `CREATE TABLE flight_info (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          flight_number VARCHAR2(20) NOT NULL,
          airline VARCHAR2(100) NOT NULL,
          departure_airport VARCHAR2(10) NOT NULL,
          departure_city VARCHAR2(100) NOT NULL,
          departure_terminal VARCHAR2(10),
          departure_date TIMESTAMP NOT NULL,
          departure_gate VARCHAR2(10),
          arrival_airport VARCHAR2(10) NOT NULL,
          arrival_city VARCHAR2(100) NOT NULL,
          arrival_terminal VARCHAR2(10),
          arrival_date TIMESTAMP NOT NULL,
          class VARCHAR2(20),
          seat VARCHAR2(10),
          status VARCHAR2(20) DEFAULT 'upcoming',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_flight_user FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      },
      {
        name: 'payment_methods',
        sql: `CREATE TABLE payment_methods (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          type VARCHAR2(20) NOT NULL,
          brand VARCHAR2(50) NOT NULL,
          last4 VARCHAR2(4) NOT NULL,
          expiry_month NUMBER(2,0) NOT NULL,
          expiry_year NUMBER(4,0) NOT NULL,
          is_default NUMBER(1) DEFAULT 0,
          active NUMBER(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      },
      {
        name: 'orders',
        sql: `CREATE TABLE orders (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          total NUMBER(10,2) NOT NULL,
          items_count NUMBER(5,0) NOT NULL,
          status VARCHAR2(20) DEFAULT 'pending',
          qr_code VARCHAR2(500),
          payment_method_id VARCHAR2(50),
          terminal VARCHAR2(10),
          pickup_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
          CONSTRAINT fk_order_payment FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
        )`
      },
      {
        name: 'order_items',
        sql: `CREATE TABLE order_items (
          id VARCHAR2(50) PRIMARY KEY,
          order_id VARCHAR2(50) NOT NULL,
          product_id VARCHAR2(50) NOT NULL,
          quantity NUMBER(5,0) NOT NULL,
          price NUMBER(10,2) NOT NULL,
          discount_applied NUMBER(10,2) DEFAULT 0,
          subtotal NUMBER(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          CONSTRAINT fk_order_item_product FOREIGN KEY (product_id) REFERENCES products(id)
        )`
      },
      {
        name: 'reviews',
        sql: `CREATE TABLE reviews (
          id VARCHAR2(50) PRIMARY KEY,
          product_id VARCHAR2(50) NOT NULL,
          user_id VARCHAR2(50) NOT NULL,
          rating NUMBER(1,0) NOT NULL,
          title_en VARCHAR2(200),
          title_es VARCHAR2(200),
          comment_en CLOB,
          comment_es CLOB,
          verified NUMBER(1) DEFAULT 0,
          helpful_count NUMBER(10,0) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products(id),
          CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id)
        )`
      },
      {
        name: 'coupons',
        sql: `CREATE TABLE coupons (
          id VARCHAR2(50) PRIMARY KEY,
          code VARCHAR2(50) UNIQUE NOT NULL,
          type VARCHAR2(20) NOT NULL,
          value NUMBER(10,2) NOT NULL,
          description_en VARCHAR2(500),
          description_es VARCHAR2(500),
          min_purchase NUMBER(10,2) DEFAULT 0,
          max_discount NUMBER(10,2),
          active NUMBER(1) DEFAULT 1,
          expiry_date TIMESTAMP,
          usage_limit NUMBER(10,0),
          usage_count NUMBER(10,0) DEFAULT 0,
          loyalty_tier_required VARCHAR2(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'coupon_categories',
        sql: `CREATE TABLE coupon_categories (
          coupon_id VARCHAR2(50) NOT NULL,
          category_id VARCHAR2(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (coupon_id, category_id),
          CONSTRAINT fk_coupon_cat_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
          CONSTRAINT fk_coupon_cat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'terminals',
        sql: `CREATE TABLE terminals (
          id VARCHAR2(50) PRIMARY KEY,
          code VARCHAR2(10) UNIQUE NOT NULL,
          name_en VARCHAR2(200) NOT NULL,
          name_es VARCHAR2(200) NOT NULL,
          airport VARCHAR2(10) NOT NULL,
          pickup_time_en VARCHAR2(200),
          pickup_time_es VARCHAR2(200),
          active NUMBER(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'terminal_stores',
        sql: `CREATE TABLE terminal_stores (
          id VARCHAR2(50) PRIMARY KEY,
          terminal_id VARCHAR2(50) NOT NULL,
          name VARCHAR2(200) NOT NULL,
          location VARCHAR2(200),
          hours VARCHAR2(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_store_terminal FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'terminal_store_categories',
        sql: `CREATE TABLE terminal_store_categories (
          store_id VARCHAR2(50) NOT NULL,
          category_id VARCHAR2(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (store_id, category_id),
          CONSTRAINT fk_store_cat_store FOREIGN KEY (store_id) REFERENCES terminal_stores(id) ON DELETE CASCADE,
          CONSTRAINT fk_store_cat_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'terminal_features',
        sql: `CREATE TABLE terminal_features (
          id VARCHAR2(50) PRIMARY KEY,
          terminal_id VARCHAR2(50) NOT NULL,
          feature_en VARCHAR2(200) NOT NULL,
          feature_es VARCHAR2(200) NOT NULL,
          display_order NUMBER(3,0) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_feature_terminal FOREIGN KEY (terminal_id) REFERENCES terminals(id) ON DELETE CASCADE
        )`
      },
      {
        name: 'promotions',
        sql: `CREATE TABLE promotions (
          id VARCHAR2(50) PRIMARY KEY,
          type VARCHAR2(20) NOT NULL,
          title_en VARCHAR2(200) NOT NULL,
          title_es VARCHAR2(200) NOT NULL,
          subtitle_en VARCHAR2(500),
          subtitle_es VARCHAR2(500),
          image VARCHAR2(500),
          cta_en VARCHAR2(100),
          cta_es VARCHAR2(100),
          link VARCHAR2(500),
          coupon_code VARCHAR2(50),
          active NUMBER(1) DEFAULT 1,
          priority NUMBER(3,0) DEFAULT 0,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'wishlist',
        sql: `CREATE TABLE wishlist (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          product_id VARCHAR2(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT uk_wishlist UNIQUE (user_id, product_id)
        )`
      }
    ];

    for (const table of tables) {
      try {
        await connection.execute(table.sql);
        console.log(`  ✓ Tabla creada: ${table.name}`);
      } catch (err) {
        if (err.message.includes('ORA-00955')) {
          console.log(`  ⚠  Tabla ya existe: ${table.name}`);
        } else {
          console.error(`  ✗ Error creando ${table.name}:`, err.message);
        }
      }
    }

    await connection.commit();
    console.log('\n✅ Todas las tablas procesadas\n');

    await connection.close();
    console.log('✅ Proceso completado\n');

  } catch (error) {
    console.error('\n❌ ERROR:\n', error.message);
    process.exit(1);
  }
}

executeDDL();
