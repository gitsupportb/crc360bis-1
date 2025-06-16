import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === "admin" && password === "BCP2Sadmin") {
      return NextResponse.json({
        success: true,
        message: 'Test login successful',
        user: { username: "admin", role: 'administrator' }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test auth endpoint' });
}
