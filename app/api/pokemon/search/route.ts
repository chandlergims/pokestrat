import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const pageSize = searchParams.get('pageSize') || '20';
  
  if (!name) {
    return NextResponse.json({ error: 'Name parameter required' }, { status: 400 });
  }

  try {
    // Build query exactly as Pokemon TCG API expects: name:charizard
    const query = `name:${name}`;
    
    // Build the full URL with proper encoding
    const url = new URL('https://api.pokemontcg.io/v2/cards');
    url.searchParams.set('q', query);
    url.searchParams.set('pageSize', pageSize);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    console.log('Fetching from Pokemon API:', url.toString());
    
    const response = await fetch(url.toString(), { 
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Pokemon API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error body:', errorText);
      return NextResponse.json(
        { error: `Pokemon API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Pokemon API success, got', data.data?.length, 'cards');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Pokemon API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Pokemon API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
