/**
 * Execute Order Enhancement Migration - Improved Version
 * Properly handles Oracle SQL with PL/SQL blocks
 */

const oracledb = require('oracledb');

// Configure Oracle client
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function executeMigration() {
  let connection;

  try {
    console.log('Connecting to Oracle Autonomous Database...');

    const pool = await oracledb.createPool({
      user: process.env.DB_USER || 'ADMIN',
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD,
      poolMin: 1,
      poolMax: 1
    });

    connection = await pool.getConnection();
    console.log('✓ Connected to database\n');

    // Define all SQL statements to execute in order
    const migrations = [
      // Add customer information fields to ORDERS
      {
        name: 'Add customer fields to ORDERS',
        sql: `ALTER TABLE orders ADD (
          customer_name VARCHAR2(200),
          customer_email VARCHAR2(200),
          customer_phone VARCHAR2(50),
          customer_passport VARCHAR2(50),
          customer_nationality VARCHAR2(50)
        )`
      },
      // Add flight information to ORDERS
      {
        name: 'Add flight fields to ORDERS',
        sql: `ALTER TABLE orders ADD (
          flight_number VARCHAR2(20),
          flight_date TIMESTAMP,
          departure_airport VARCHAR2(10),
          arrival_airport VARCHAR2(10)
        )`
      },
      // Add payment and discount information to ORDERS
      {
        name: 'Add payment fields to ORDERS',
        sql: `ALTER TABLE orders ADD (
          subtotal NUMBER(10,2) DEFAULT 0,
          tax_amount NUMBER(10,2) DEFAULT 0,
          discount_amount NUMBER(10,2) DEFAULT 0,
          coupon_code VARCHAR2(50),
          payment_status VARCHAR2(20) DEFAULT 'pending',
          payment_method VARCHAR2(50)
        )`
      },
      // Add fulfillment tracking to ORDERS
      {
        name: 'Add fulfillment fields to ORDERS',
        sql: `ALTER TABLE orders ADD (
          pickup_location VARCHAR2(200),
          pickup_instructions CLOB,
          collected_at TIMESTAMP,
          collected_by VARCHAR2(200),
          notes CLOB
        )`
      },
      // Add payment status constraint
      {
        name: 'Add payment_status constraint',
        sql: `ALTER TABLE orders ADD CONSTRAINT chk_payment_status
          CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))`
      },
      // Create indexes
      {
        name: 'Create flight index',
        sql: `CREATE INDEX idx_order_flight ON orders(flight_number, flight_date)`
      },
      {
        name: 'Create payment_status index',
        sql: `CREATE INDEX idx_order_payment_status ON orders(payment_status)`
      },
      {
        name: 'Create pickup_time index',
        sql: `CREATE INDEX idx_order_pickup_time ON orders(pickup_time)`
      },
      {
        name: 'Create qr_code index',
        sql: `CREATE INDEX idx_order_qr ON orders(qr_code)`
      },
      // Create customer QR codes table
      {
        name: 'Create CUSTOMER_QR_CODES table',
        sql: `CREATE TABLE customer_qr_codes (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          qr_code VARCHAR2(500) UNIQUE NOT NULL,
          qr_data CLOB NOT NULL,
          type VARCHAR2(20) DEFAULT 'customer',
          purpose VARCHAR2(100),
          flight_id VARCHAR2(50),
          active NUMBER(1) DEFAULT 1,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_customer_qr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_customer_qr_flight FOREIGN KEY (flight_id) REFERENCES flight_info(id),
          CONSTRAINT chk_qr_type CHECK (type IN ('customer', 'boarding', 'loyalty', 'order'))
        )`
      },
      {
        name: 'Create customer_qr_codes indexes',
        sql: `CREATE INDEX idx_customer_qr_user ON customer_qr_codes(user_id)`
      },
      {
        name: 'Create qr_code index',
        sql: `CREATE INDEX idx_customer_qr_code ON customer_qr_codes(qr_code)`
      },
      // Create order status history table
      {
        name: 'Create ORDER_STATUS_HISTORY table',
        sql: `CREATE TABLE order_status_history (
          id VARCHAR2(50) PRIMARY KEY,
          order_id VARCHAR2(50) NOT NULL,
          previous_status VARCHAR2(20),
          new_status VARCHAR2(20) NOT NULL,
          changed_by VARCHAR2(50),
          notes CLOB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_order_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          CONSTRAINT chk_history_prev_status CHECK (previous_status IN ('pending', 'ready', 'completed', 'cancelled')),
          CONSTRAINT chk_history_new_status CHECK (new_status IN ('pending', 'ready', 'completed', 'cancelled'))
        )`
      },
      {
        name: 'Create order_history indexes',
        sql: `CREATE INDEX idx_order_history_order ON order_status_history(order_id)`
      },
      // Create order QR scans table
      {
        name: 'Create ORDER_QR_SCANS table',
        sql: `CREATE TABLE order_qr_scans (
          id VARCHAR2(50) PRIMARY KEY,
          order_id VARCHAR2(50) NOT NULL,
          qr_code VARCHAR2(500) NOT NULL,
          scanned_by VARCHAR2(50),
          scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          scan_location VARCHAR2(200),
          terminal VARCHAR2(10),
          device_id VARCHAR2(100),
          result VARCHAR2(20) DEFAULT 'success',
          notes CLOB,
          CONSTRAINT fk_qr_scan_order FOREIGN KEY (order_id) REFERENCES orders(id),
          CONSTRAINT chk_scan_result CHECK (result IN ('success', 'failed', 'invalid', 'expired'))
        )`
      },
      {
        name: 'Create qr_scans indexes',
        sql: `CREATE INDEX idx_qr_scan_order ON order_qr_scans(order_id)`
      },
      // Create loyalty cards table
      {
        name: 'Create LOYALTY_CARDS table',
        sql: `CREATE TABLE loyalty_cards (
          id VARCHAR2(50) PRIMARY KEY,
          user_id VARCHAR2(50) NOT NULL,
          card_number VARCHAR2(50) UNIQUE NOT NULL,
          qr_code VARCHAR2(500) UNIQUE NOT NULL,
          tier VARCHAR2(20) DEFAULT 'bronze',
          points NUMBER(10,0) DEFAULT 0,
          points_lifetime NUMBER(10,0) DEFAULT 0,
          status VARCHAR2(20) DEFAULT 'active',
          issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          last_used_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_loyalty_user FOREIGN KEY (user_id) REFERENCES users(id),
          CONSTRAINT chk_loyalty_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
          CONSTRAINT chk_loyalty_status CHECK (status IN ('active', 'suspended', 'expired', 'cancelled'))
        )`
      },
      {
        name: 'Create loyalty_cards indexes',
        sql: `CREATE INDEX idx_loyalty_user ON loyalty_cards(user_id)`
      },
      // Create loyalty transactions table
      {
        name: 'Create LOYALTY_TRANSACTIONS table',
        sql: `CREATE TABLE loyalty_transactions (
          id VARCHAR2(50) PRIMARY KEY,
          loyalty_card_id VARCHAR2(50) NOT NULL,
          order_id VARCHAR2(50),
          type VARCHAR2(20) NOT NULL,
          points NUMBER(10,0) NOT NULL,
          balance_after NUMBER(10,0) NOT NULL,
          description VARCHAR2(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_loyalty_trans_card FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id),
          CONSTRAINT fk_loyalty_trans_order FOREIGN KEY (order_id) REFERENCES orders(id),
          CONSTRAINT chk_loyalty_type CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted', 'bonus'))
        )`
      },
      {
        name: 'Create loyalty_transactions indexes',
        sql: `CREATE INDEX idx_loyalty_trans_card ON loyalty_transactions(loyalty_card_id)`
      }
    ];

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    console.log(`Executing ${migrations.length} migration statements...\n`);

    for (const [index, migration] of migrations.entries()) {
      try {
        console.log(`[${index + 1}/${migrations.length}] ${migration.name}...`);
        await connection.execute(migration.sql, [], { autoCommit: true });
        successCount++;
        console.log('  ✓ Success\n');
      } catch (err) {
        if (err.message.includes('ORA-01430') ||  // column already exists
            err.message.includes('ORA-00955') ||  // name already used
            err.message.includes('ORA-02260') ||  // table already has primary key
            err.message.includes('ORA-01408') ||  // index already exists
            err.message.includes('ORA-02264')) {  // name already used by constraint
          console.log('  ⊘ Already exists, skipping\n');
          skipCount++;
        } else {
          console.error('  ✗ Error:', err.message);
          errorCount++;
        }
      }
    }

    console.log('\n========================================');
    console.log('Migration Summary:');
    console.log(`  ✓ Successfully executed: ${successCount}`);
    console.log(`  ⊘ Skipped (already exists): ${skipCount}`);
    console.log(`  ✗ Errors: ${errorCount}`);
    console.log(`  Total statements: ${migrations.length}`);
    console.log('========================================\n');

    // Verify results
    console.log('Verifying migration results...\n');

    // Check new columns
    const newColumns = ['CUSTOMER_NAME', 'FLIGHT_NUMBER', 'SUBTOTAL', 'PAYMENT_STATUS', 'PICKUP_LOCATION'];
    for (const col of newColumns) {
      const result = await connection.execute(
        `SELECT COUNT(*) as cnt FROM user_tab_columns WHERE table_name = 'ORDERS' AND column_name = :col`,
        { col }
      );
      const exists = result.rows[0].CNT > 0;
      console.log(`  ${exists ? '✓' : '✗'} ORDERS.${col}`);
    }

    // Check new tables
    const newTables = ['CUSTOMER_QR_CODES', 'ORDER_STATUS_HISTORY', 'ORDER_QR_SCANS', 'LOYALTY_CARDS', 'LOYALTY_TRANSACTIONS'];
    console.log('');
    for (const table of newTables) {
      const result = await connection.execute(
        `SELECT COUNT(*) as cnt FROM user_tables WHERE table_name = :table`,
        { table }
      );
      const exists = result.rows[0].CNT > 0;
      console.log(`  ${exists ? '✓' : '✗'} ${table}`);
    }

    console.log('\n✅ Migration completed!\n');

    await connection.close();
    await pool.close();

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        // ignore
      }
    }
    process.exit(1);
  }
}

executeMigration();
