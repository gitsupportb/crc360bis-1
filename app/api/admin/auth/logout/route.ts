import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    // Clear session cookies
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/admin'
    });

    response.cookies.set('admin-user', '', {
      maxAge: 0,
      path: '/admin'
    });

    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Admin logout endpoint',
    method: 'POST'
  });
}
