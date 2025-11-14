import oracledb from 'oracledb';
import path from 'path';

// Configuración del pool de conexiones
const poolConfig = {
  user: process.env.DB_USER || 'ADMIN',
  password: process.env.DB_PASSWORD || '',
  connectString: process.env.DB_CONNECT_STRING || '',
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  queueTimeout: 60000,
  enableStatistics: true
};

// Pool de conexiones global
let pool: oracledb.Pool | null = null;

// Configurar el directorio del wallet
if (process.env.WALLET_LOCATION) {
  oracledb.initOracleClient({
    configDir: process.env.WALLET_LOCATION,
    libDir: process.env.ORACLE_CLIENT_LIB_DIR
  });
}

// Crear pool de conexiones
export async function createPool() {
  try {
    if (!pool) {
      pool = await oracledb.createPool(poolConfig);
      console.log('✅ Oracle Database connection pool created successfully');
    }
    return pool;
  } catch (error) {
    console.error('❌ Error creating Oracle Database connection pool:', error);
    throw error;
  }
}

// Obtener una conexión del pool
export async function getConnection() {
  try {
    if (!pool) {
      await createPool();
    }
    const connection = await pool!.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Error getting database connection:', error);
    throw error;
  }
}

// Cerrar pool de conexiones
export async function closePool() {
  try {
    if (pool) {
      await pool.close(10);
      pool = null;
      console.log('✅ Oracle Database connection pool closed');
    }
  } catch (error) {
    console.error('❌ Error closing Oracle Database connection pool:', error);
    throw error;
  }
}

// Ejecutar una query
export async function executeQuery<T = any>(
  sql: string,
  binds: any = {},
  options: oracledb.ExecuteOptions = {}
): Promise<oracledb.Result<T>> {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options
    });
    return result;
  } catch (error) {
    console.error('❌ Error executing query:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

// Ejecutar múltiples queries en una transacción
export async function executeTransaction(
  queries: { sql: string; binds?: any }[]
): Promise<void> {
  let connection;
  try {
    connection = await getConnection();

    for (const query of queries) {
      await connection.execute(query.sql, query.binds || {}, {
        autoCommit: false
      });
    }

    await connection.commit();
    console.log('✅ Transaction committed successfully');
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error('❌ Transaction rolled back due to error:', error);
    }
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('❌ Error closing connection:', error);
      }
    }
  }
}

// Inicializar el pool al cargar el módulo
if (process.env.NODE_ENV !== 'test') {
  createPool().catch(err => {
    console.error('Failed to create initial connection pool:', err);
  });
}

export default {
  createPool,
  getConnection,
  closePool,
  executeQuery,
  executeTransaction
};
