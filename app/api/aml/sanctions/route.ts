import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for sanctions data (in production, use a database)
let sanctionsData: any[] = [];

export async function GET() {
  try {
    return NextResponse.json(sanctionsData);
  } catch (error) {
    console.error('Error fetching sanctions data:', error);
    return NextResponse.json({ error: 'Failed to fetch sanctions data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    sanctionsData = data;
    return NextResponse.json({ success: true, count: sanctionsData.length });
  } catch (error) {
    console.error('Error updating sanctions data:', error);
    return NextResponse.json({ error: 'Failed to update sanctions data' }, { status: 500 });
  }
}
