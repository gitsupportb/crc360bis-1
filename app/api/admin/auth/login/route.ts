import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { username, password } = await request.json();

    // Simple credential check - same as DOC Secure admin
    if (username === "admin" && password === "BCP2Sadmin") {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          username: "admin",
          role: 'administrator',
          permissions: ['email_admin', 'docsecure_admin', 'system_admin']
        }
      });

      // Set session cookies
      response.cookies.set('admin-session', 'authenticated', {
        httpOnly: true,
        maxAge: 86400, // 24 hours
        path: '/admin'
      });

      response.cookies.set('admin-user', 'admin:administrator', {
        maxAge: 86400, // 24 hours
        path: '/admin'
      });

      return response;
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid username or password'
      }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'BCP2S Admin Authentication API',
    endpoints: {
      login: 'POST /api/admin/auth/login',
      logout: 'POST /api/admin/auth/logout',
      verify: 'GET /api/admin/auth/verify'
    }
  });
}
