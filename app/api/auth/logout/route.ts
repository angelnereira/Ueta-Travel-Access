import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/auth/logout - User logout
export async function POST(request: NextRequest) {
  try {
    // Delete session cookie
    cookies().delete('session');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
