#!/usr/bin/env node

// Script para ejecutar las migraciones de base de datos
require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;

  console.log('\n=== Ueta Travel Access - Database Migration ===\n');

  try {
    // Configuración de conexión
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD
    };

    console.log('📡 Conectando a Oracle Database...\n');
    connection = await oracledb.getConnection(config);
    console.log('✅ Conexión exitosa!\n');

    // Leer y ejecutar el script de creación de tablas
    console.log('📋 Ejecutando script 01-create-tables.sql...\n');
    const createTablesSQL = fs.readFileSync(
      path.join(__dirname, '01-create-tables.sql'),
      'utf8'
    );

    // Dividir el archivo SQL en statements individuales
    const statements = createTablesSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'COMMIT');

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        // Ejecutar statement
        await connection.execute(statement, [], { autoCommit: false });
        successCount++;

        // Mostrar progreso para operaciones importantes
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ Tabla creada: ${match[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE TRIGGER')) {
          const match = statement.match(/CREATE.*TRIGGER\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ Trigger creado: ${match[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE SEQUENCE')) {
          const match = statement.match(/CREATE SEQUENCE\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ Secuencia creada: ${match[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX\s+(\w+)/i);
          if (match) {
            console.log(`  ✓ Índice creado: ${match[1]}`);
          }
        }
      } catch (err) {
        // Si el objeto ya existe, solo mostrar advertencia
        if (err.message.includes('ORA-00955') || err.message.includes('already exists')) {
          skipCount++;
        } else if (err.message.includes('ORA-04043') || err.message.includes('does not exist')) {
          // Object does not exist when trying to drop - ignore
          skipCount++;
        } else {
          console.error(`\n❌ Error ejecutando statement:`);
          console.error(statement.substring(0, 100) + '...');
          console.error(err.message);
        }
      }
    }

    await connection.commit();
    console.log(`\n✅ Script de tablas completado: ${successCount} operaciones exitosas, ${skipCount} omitidas\n`);

    // Leer y ejecutar el script de datos
    console.log('📋 Ejecutando script 02-insert-data.sql...\n');
    const insertDataSQL = fs.readFileSync(
      path.join(__dirname, '02-insert-data.sql'),
      'utf8'
    );

    const dataStatements = insertDataSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'COMMIT');

    let insertCount = 0;
    let skipInsertCount = 0;

    for (const statement of dataStatements) {
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        await connection.execute(statement, [], { autoCommit: false });
        insertCount++;

        // Mostrar progreso para inserts
        if (statement.toUpperCase().startsWith('INSERT INTO')) {
          const match = statement.match(/INSERT INTO\s+(\w+)/i);
          if (match && insertCount % 5 === 0) {
            console.log(`  ✓ Insertando datos en: ${match[1]}...`);
          }
        }
      } catch (err) {
        // Si la fila ya existe (unique constraint), solo advertir
        if (err.message.includes('ORA-00001') || err.message.includes('unique constraint')) {
          skipInsertCount++;
        } else {
          console.error(`\n⚠️  Error insertando datos:`);
          console.error(statement.substring(0, 100) + '...');
          console.error(err.message);
        }
      }
    }

    await connection.commit();
    console.log(`\n✅ Script de datos completado: ${insertCount} inserts exitosos, ${skipInsertCount} omitidos\n`);

    // Verificar datos insertados
    console.log('📊 Verificando datos insertados:\n');

    const verificationQueries = [
      { name: 'Categories', query: 'SELECT COUNT(*) as count FROM categories' },
      { name: 'Subcategories', query: 'SELECT COUNT(*) as count FROM subcategories' },
      { name: 'Products', query: 'SELECT COUNT(*) as count FROM products' },
      { name: 'Users', query: 'SELECT COUNT(*) as count FROM users' },
      { name: 'Terminals', query: 'SELECT COUNT(*) as count FROM terminals' },
      { name: 'Orders', query: 'SELECT COUNT(*) as count FROM orders' },
      { name: 'Coupons', query: 'SELECT COUNT(*) as count FROM coupons' },
      { name: 'Promotions', query: 'SELECT COUNT(*) as count FROM promotions' },
      { name: 'Reviews', query: 'SELECT COUNT(*) as count FROM reviews' }
    ];

    for (const { name, query } of verificationQueries) {
      try {
        const result = await connection.execute(query);
        const count = result.rows[0][0];
        console.log(`  ${name.padEnd(20)} : ${count} registros`);
      } catch (err) {
        console.log(`  ${name.padEnd(20)} : Error (${err.message})`);
      }
    }

    console.log('\n✅ Migración completada exitosamente!\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:\n');
    console.error('Mensaje:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada.\n');
      } catch (err) {
        console.error('Error cerrando conexión:', err.message);
      }
    }
  }
}

// Ejecutar la migración
runMigration().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
