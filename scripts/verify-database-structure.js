#!/usr/bin/env node

/**
 * Script para verificar la estructura de la base de datos Oracle
 * y listar todos los recursos disponibles
 */

const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env.local')
});

async function verifyDatabase() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...\n');

    // Importar el módulo de DB
    const { getConnection } = require('../lib/db/oracledb');

    const connection = await getConnection();
    console.log('✅ Conexión establecida correctamente\n');

    // 1. Listar todas las tablas
    console.log('📊 TABLAS EN LA BASE DE DATOS:');
    console.log('━'.repeat(60));
    const tablesResult = await connection.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`
    );

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No hay tablas creadas en la base de datos');
    } else {
      tablesResult.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row[0]}`);
      });
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // 2. Verificar cada tabla y su estructura
    for (const [idx, row] of tablesResult.rows.entries()) {
      const tableName = row[0];
      console.log(`\n📋 Estructura de: ${tableName}`);
      console.log('─'.repeat(60));

      // Obtener columnas
      const columnsResult = await connection.execute(
        `SELECT column_name, data_type, data_length, nullable
         FROM user_tab_columns
         WHERE table_name = :tableName
         ORDER BY column_id`,
        [tableName]
      );

      columnsResult.rows.forEach(col => {
        const [name, type, length, nullable] = col;
        const nullInfo = nullable === 'N' ? 'NOT NULL' : 'NULL';
        console.log(`  • ${name.padEnd(30)} ${type}${type.includes('CHAR') ? `(${length})` : ''} ${nullInfo}`);
      });

      // Contar registros
      const countResult = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      const recordCount = countResult.rows[0][0];
      console.log(`\n  📊 Registros: ${recordCount}`);
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // 3. Listar secuencias
    console.log('🔢 SECUENCIAS:');
    console.log('━'.repeat(60));
    const seqResult = await connection.execute(
      `SELECT sequence_name FROM user_sequences ORDER BY sequence_name`
    );

    if (seqResult.rows.length === 0) {
      console.log('⚠️  No hay secuencias creadas');
    } else {
      seqResult.rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row[0]}`);
      });
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // 4. Listar índices
    console.log('📇 ÍNDICES:');
    console.log('━'.repeat(60));
    const idxResult = await connection.execute(
      `SELECT index_name, table_name, uniqueness
       FROM user_indexes
       WHERE table_name IN (SELECT table_name FROM user_tables)
       ORDER BY table_name, index_name`
    );

    if (idxResult.rows.length === 0) {
      console.log('⚠️  No hay índices creados');
    } else {
      let currentTable = '';
      idxResult.rows.forEach(row => {
        const [indexName, tableName, uniqueness] = row;
        if (tableName !== currentTable) {
          if (currentTable !== '') console.log('');
          console.log(`\n  Tabla: ${tableName}`);
          currentTable = tableName;
        }
        const unique = uniqueness === 'UNIQUE' ? '🔑 UNIQUE' : '  ';
        console.log(`    ${unique} ${indexName}`);
      });
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // 5. Información de almacenamiento
    console.log('💾 INFORMACIÓN DE ALMACENAMIENTO:');
    console.log('━'.repeat(60));
    const storageResult = await connection.execute(
      `SELECT
         SUM(bytes)/1024/1024 as total_mb,
         SUM(blocks) as total_blocks
       FROM user_segments`
    );

    if (storageResult.rows.length > 0 && storageResult.rows[0][0]) {
      const [totalMb, totalBlocks] = storageResult.rows[0];
      console.log(`  Espacio total usado: ${totalMb.toFixed(2)} MB`);
      console.log(`  Bloques totales: ${totalBlocks}`);
    } else {
      console.log('  Sin datos de almacenamiento');
    }

    console.log('\n' + '━'.repeat(60) + '\n');

    // 6. Versión de la base de datos
    console.log('ℹ️  INFORMACIÓN DEL SISTEMA:');
    console.log('━'.repeat(60));
    const versionResult = await connection.execute(
      `SELECT banner FROM v$version WHERE ROWNUM = 1`
    );
    if (versionResult.rows.length > 0) {
      console.log(`  Versión: ${versionResult.rows[0][0]}`);
    }

    const dbNameResult = await connection.execute(
      `SELECT name, created FROM v$database`
    );
    if (dbNameResult.rows.length > 0) {
      const [name, created] = dbNameResult.rows[0];
      console.log(`  Nombre: ${name}`);
      console.log(`  Creada: ${created.toISOString().split('T')[0]}`);
    }

    await connection.close();

    console.log('\n✅ Verificación completada exitosamente\n');

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:');
    console.error(error.message);
    process.exit(1);
  }
}

verifyDatabase();
