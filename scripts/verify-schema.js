#!/usr/bin/env node

// Script para verificar el esquema actual de la base de datos
require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function verifySchema() {
  let connection;

  console.log('\n=== Verificando Esquema de Base de Datos ===\n');

  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD
    };

    connection = await oracledb.getConnection(config);
    console.log('✅ Conectado a Oracle Database\n');

    // Listar todas las tablas del usuario
    console.log('📋 Tablas existentes:\n');
    const tables = await connection.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`
    );

    if (tables.rows.length > 0) {
      tables.rows.forEach((row, index) => {
        console.log(`  ${(index + 1).toString().padStart(2)}. ${row[0]}`);
      });
      console.log(`\nTotal: ${tables.rows.length} tablas\n`);
    } else {
      console.log('  ⚠️  No se encontraron tablas\n');
    }

    //Listar secuencias
    console.log('🔢 Secuencias existentes:\n');
    const sequences = await connection.execute(
      `SELECT sequence_name FROM user_sequences ORDER BY sequence_name`
    );

    if (sequences.rows.length > 0) {
      sequences.rows.forEach((row, index) => {
        console.log(`  ${(index + 1).toString().padStart(2)}. ${row[0]}`);
      });
      console.log(`\nTotal: ${sequences.rows.length} secuencias\n`);
    } else {
      console.log('  ⚠️  No se encontraron secuencias\n');
    }

    // Listar triggers
    console.log('⚡ Triggers existentes:\n');
    const triggers = await connection.execute(
      `SELECT trigger_name, table_name FROM user_triggers ORDER BY trigger_name`
    );

    if (triggers.rows.length > 0) {
      triggers.rows.forEach((row, index) => {
        console.log(`  ${(index + 1).toString().padStart(2)}. ${row[0]} (${row[1]})`);
      });
      console.log(`\nTotal: ${triggers.rows.length} triggers\n`);
    } else {
      console.log('  ⚠️  No se encontraron triggers\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:\n');
    console.error('Mensaje:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.close();
      console.log('🔌 Conexión cerrada.\n');
    }
  }
}

verifySchema().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
