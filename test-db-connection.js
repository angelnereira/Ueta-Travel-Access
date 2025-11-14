#!/usr/bin/env node

// Script de prueba de conexión a Oracle Database
require('dotenv').config({ path: '.env.local' });
const oracledb = require('oracledb');

async function testConnection() {
  let connection;

  console.log('\n=== Iniciando prueba de conexión a Oracle Database ===\n');

  // Mostrar configuración (sin mostrar password completo)
  console.log('Configuración:');
  console.log('- Usuario:', process.env.DB_USER);
  console.log('- Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NO CONFIGURADO');
  console.log('- Connect String:', process.env.DB_CONNECT_STRING);
  console.log('- Wallet Location:', process.env.WALLET_LOCATION);
  console.log('- Wallet Password:', process.env.WALLET_PASSWORD ? '***' + process.env.WALLET_PASSWORD.slice(-4) : 'NO CONFIGURADO');
  console.log('\n');

  try {
    // Configuración de conexión
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      walletLocation: process.env.WALLET_LOCATION,
      walletPassword: process.env.WALLET_PASSWORD
    };

    console.log('📡 Intentando conectar a Oracle Database...\n');

    // Crear conexión
    connection = await oracledb.getConnection(config);

    console.log('✅ CONEXIÓN EXITOSA!\n');

    // Ejecutar una query simple para verificar
    console.log('🔍 Ejecutando query de prueba: SELECT * FROM DUAL...\n');
    const result = await connection.execute(
      'SELECT \'Conexión exitosa!\' AS mensaje, SYSDATE AS fecha FROM DUAL'
    );

    console.log('✅ Query ejecutada exitosamente!');
    console.log('Resultado:', result.rows);
    console.log('\n');

    // Obtener información de la base de datos
    console.log('📊 Información de la base de datos:');
    const dbInfo = await connection.execute(
      `SELECT
        BANNER_FULL AS version
      FROM V$VERSION
      WHERE ROWNUM = 1`
    );
    console.log('Version:', dbInfo.rows[0] ? dbInfo.rows[0][0] : 'N/A');
    console.log('\n');

    // Verificar tablas de usuario
    console.log('📋 Verificando tablas del usuario...');
    const tables = await connection.execute(
      `SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME`
    );

    if (tables.rows.length > 0) {
      console.log(`Se encontraron ${tables.rows.length} tablas:`);
      tables.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row[0]}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas. La base de datos está vacía.');
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente!\n');

  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:\n');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);

    if (error.code) {
      console.error('Código de error:', error.code);
    }

    console.error('\nStack trace:');
    console.error(error.stack);

    console.error('\n💡 Soluciones posibles:');
    console.error('1. Verifica que las credenciales en .env.local sean correctas');
    console.error('2. Verifica que el wallet esté en la ubicación correcta');
    console.error('3. Verifica que el wallet password sea correcto');
    console.error('4. Verifica que el string de conexión sea correcto');
    console.error('5. Verifica que la base de datos esté accesible desde tu red\n');

    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Conexión cerrada correctamente.\n');
      } catch (err) {
        console.error('Error al cerrar la conexión:', err.message);
      }
    }
  }
}

// Ejecutar la prueba
testConnection().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
