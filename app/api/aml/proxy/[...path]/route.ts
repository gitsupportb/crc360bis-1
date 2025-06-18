import { NextRequest, NextResponse } from 'next/server';

const LBCFT_BASE_URL = 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path?.join('/') || '';
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${LBCFT_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log('Proxying GET request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/html',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path?.join('/') || '';
    const url = `${LBCFT_BASE_URL}/${path}`;
    
    console.log('Proxying POST request to:', url);
    
    // Get the form data from the request
    const formData = await request.formData();
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Redirect to the amlcenter path
        return NextResponse.redirect(new URL('/amlcenter', request.url));
      }
    }

    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/html',
      },
    });
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
