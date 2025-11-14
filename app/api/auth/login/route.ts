import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    let user = await AuthService.getUserByEmail(email);

    // If user doesn't exist, create new user (simplified for demo)
    if (!user) {
      const [firstName, ...rest] = email.split('@')[0].split('.');
      const lastName = rest.join(' ') || 'User';

      user = await AuthService.createUser({
        email,
        firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1)
      });
    }

    // Generate session token
    const sessionToken = AuthService.generateSessionToken(user.id);

    // Set cookie
    cookies().set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
        sessionToken
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
