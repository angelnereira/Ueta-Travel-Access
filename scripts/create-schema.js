#!/usr/bin/env node

/**
 * Script para crear el esquema de la base de datos Oracle
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env.local')
});

const oracledb = require('oracledb');

// Configuración de Oracle para modo Thin
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    configDir: process.env.WALLET_LOCATION,
    walletLocation: process.env.WALLET_LOCATION,
    walletPassword: process.env.WALLET_PASSWORD
  });
}

async function createSchema() {
  let connection;

  try {
    console.log('🔄 Conectando a la base de datos Oracle...\n');
    connection = await getConnection();
    console.log('✅ Conexión establecida\n');

    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '../lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Leyendo schema.sql...\n');

    // Dividir el schema en statements individuales
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Ejecutando ${statements.length} statements SQL...\n`);
    console.log('━'.repeat(60));

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      // Saltar comentarios y líneas vacías
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      // Saltar COMMIT statements (los manejaremos manualmente)
      if (statement.toUpperCase().trim() === 'COMMIT') {
        continue;
      }

      try {
        // Identificar el tipo de statement
        const upperStmt = statement.toUpperCase();
        let description = '';

        if (upperStmt.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE (\w+)/i);
          description = `Crear tabla: ${match ? match[1] : 'unknown'}`;
        } else if (upperStmt.includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX (\w+)/i);
          description = `Crear índice: ${match ? match[1] : 'unknown'}`;
        } else if (upperStmt.includes('INSERT INTO')) {
          const match = statement.match(/INSERT INTO (\w+)/i);
          description = `Insertar en: ${match ? match[1] : 'unknown'}`;
        } else {
          description = statement.substring(0, 50) + '...';
        }

        console.log(`⏳ ${description}`);
        await connection.execute(statement);
        console.log(`✅ ${description}\n`);
        successCount++;

      } catch (error) {
        // Ignorar errores de "ya existe"
        if (error.errorNum === 955 || error.errorNum === 942 || error.errorNum === 1408 || error.errorNum === 2260) {
          console.log(`⚠️  Ya existe - saltando\n`);
          skipCount++;
        } else {
          console.error(`❌ Error: ${error.message}\n`);
          console.error(`Statement: ${statement.substring(0, 100)}...\n`);
          throw error;
        }
      }
    }

    await connection.commit();

    console.log('━'.repeat(60));
    console.log('\n✅ ESQUEMA CREADO EXITOSAMENTE\n');
    console.log(`✓ Statements ejecutados: ${successCount}`);
    console.log(`⚠ Statements saltados: ${skipCount}`);

    // Verificar tablas creadas
    console.log('\n📊 Tablas creadas:\n');
    const tables = await connection.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`
    );

    tables.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.TABLE_NAME}`);
    });

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error al crear el esquema:');
    console.error(error);

    if (connection) {
      try {
        await connection.rollback();
        console.log('↩️  Cambios revertidos (rollback)');
      } catch (rollbackError) {
        console.error('❌ Error al hacer rollback:', rollbackError);
      }
    }

    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada\n');
      } catch (closeError) {
        console.error('❌ Error al cerrar conexión:', closeError);
      }
    }
  }
}

// Ejecutar el script
createSchema();
