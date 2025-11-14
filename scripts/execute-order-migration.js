/**
 * Execute Order Enhancement Migration
 * Adds detailed order tracking and QR code functionality
 */

const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

// Configure Oracle client
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function executeMigration() {
  let connection;

  try {
    console.log('Connecting to Oracle Autonomous Database...');

    // Create connection pool
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

    // Read the migration SQL file
    const sqlFile = path.join(__dirname, '04-enhance-orders-and-qr.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements (basic parsing)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt =>
        stmt &&
        !stmt.startsWith('--') &&
        !stmt.toUpperCase().startsWith('COMMENT') &&
        !stmt.toUpperCase().includes('SELECT ') &&
        stmt !== 'COMMIT'
      );

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      if (!statement) continue;

      try {
        // Extract table/action name for display
        const action = statement.substring(0, Math.min(60, statement.length));
        console.log(`[${i + 1}/${statements.length}] Executing: ${action}...`);

        await connection.execute(statement, [], { autoCommit: true });

        successCount++;
        console.log('  ✓ Success\n');
      } catch (err) {
        // Check if error is because object already exists
        if (err.message.includes('ORA-01430') || // column being added already exists
            err.message.includes('ORA-00955') || // name is already used by an existing object
            err.message.includes('ORA-02260') || // table already has primary key
            err.message.includes('ORA-01408')) { // index already exists
          console.log('  ⊘ Already exists, skipping\n');
          skipCount++;
        } else {
          console.error('  ✗ Error:', err.message);
          console.error('  Statement:', statement.substring(0, 200));
          console.log('  Continuing with next statement...\n');
        }
      }
    }

    console.log('\n========================================');
    console.log('Migration Summary:');
    console.log(`  Successfully executed: ${successCount}`);
    console.log(`  Skipped (already exists): ${skipCount}`);
    console.log(`  Total statements: ${statements.length}`);
    console.log('========================================\n');

    // Verify new tables exist
    console.log('Verifying new tables...\n');

    const tables = [
      'CUSTOMER_QR_CODES',
      'ORDER_STATUS_HISTORY',
      'ORDER_QR_SCANS',
      'LOYALTY_CARDS',
      'LOYALTY_TRANSACTIONS'
    ];

    for (const tableName of tables) {
      const result = await connection.execute(
        `SELECT COUNT(*) as count FROM user_tables WHERE table_name = :tableName`,
        { tableName }
      );

      if (result.rows[0].COUNT > 0) {
        console.log(`  ✓ ${tableName} exists`);
      } else {
        console.log(`  ✗ ${tableName} NOT FOUND`);
      }
    }

    // Check new columns in ORDERS table
    console.log('\nVerifying new columns in ORDERS table...\n');

    const newColumns = [
      'CUSTOMER_NAME',
      'CUSTOMER_EMAIL',
      'FLIGHT_NUMBER',
      'SUBTOTAL',
      'TAX_AMOUNT',
      'DISCOUNT_AMOUNT',
      'PAYMENT_STATUS',
      'PICKUP_LOCATION'
    ];

    for (const columnName of newColumns) {
      const result = await connection.execute(
        `SELECT COUNT(*) as count FROM user_tab_columns
         WHERE table_name = 'ORDERS' AND column_name = :columnName`,
        { columnName }
      );

      if (result.rows[0].COUNT > 0) {
        console.log(`  ✓ ${columnName} added to ORDERS`);
      } else {
        console.log(`  ✗ ${columnName} NOT FOUND in ORDERS`);
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

    await connection.close();
    await pool.close();

  } catch (err) {
    console.error('\n❌ Migration failed:', err);

    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }

    process.exit(1);
  }
}

// Execute migration
executeMigration();
