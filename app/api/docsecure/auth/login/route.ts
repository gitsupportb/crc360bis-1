import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Simple credential check
    if (username === "admin" && password === "BCP2Sadmin") {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          username: "admin",
          role: 'administrator',
          permissions: ['view_documents', 'download_documents', 'edit_documents', 'delete_documents']
        }
      });

      // Set session cookies
      response.cookies.set('docsecure-admin-session', 'authenticated', {
        httpOnly: true,
        maxAge: 86400, // 24 hours
        path: '/docsecure/admin'
      });

      response.cookies.set('docsecure-admin-user', 'admin:administrator', {
        maxAge: 86400, // 24 hours
        path: '/docsecure/admin'
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
    message: 'DOC Secure Admin Authentication API',
    endpoints: {
      login: 'POST /api/docsecure/auth/login',
      logout: 'POST /api/docsecure/auth/logout',
      verify: 'GET /api/docsecure/auth/verify'
    }
  });
}
