import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId, valid } = AuthService.validateSessionToken(sessionToken);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const user = await AuthService.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/me - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = cookies().get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { userId, valid } = AuthService.validateSessionToken(sessionToken);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const preferences = await request.json();
    await AuthService.updatePreferences(userId, preferences);

    const updatedUser = await AuthService.getUserById(userId);

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
