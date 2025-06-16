import { NextRequest, NextResponse } from 'next/server';

interface VerifyResponse {
  success: boolean;
  authenticated: boolean;
  user?: { username: string; role: string };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  try {
    // Get cookies from request headers
    const cookieHeader = request.headers.get('cookie');

    if (!cookieHeader) {
      return NextResponse.json({
        success: true,
        authenticated: false
      });
    }

    // Parse cookies manually
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionCookie = cookies['admin-session'];
    const userCookie = cookies['admin-user'];

    if (!sessionCookie || !userCookie) {
      return NextResponse.json({
        success: true,
        authenticated: false
      });
    }

    try {
      // Parse simple string format: "username:role"
      const [username, role] = userCookie.split(':');

      if (username && role) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user: { username, role }
        });
      } else {
        return NextResponse.json({
          success: true,
          authenticated: false
        });
      }
    } catch (parseError) {
      // Invalid user cookie
      return NextResponse.json({
        success: true,
        authenticated: false
      });
    }

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
