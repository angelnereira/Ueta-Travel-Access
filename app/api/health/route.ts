import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db/oracledb';

export async function GET() {
  try {
    const connection = await getConnection();

    // Simple query to test connection
    const result = await connection.execute(
      `SELECT 'Database connection successful!' as message, SYSTIMESTAMP as server_time FROM DUAL`
    );

    await connection.close();

    return NextResponse.json({
      success: true,
      database: 'connected',
      data: result.rows?.[0],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
