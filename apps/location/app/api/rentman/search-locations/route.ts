import { NextResponse } from 'next/server';

const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 3) {
    return NextResponse.json({ data: [] });
  }

  try {
    // Search for contacts in Rentman (Locations are stored as contacts)
    const res = await fetch(`https://api.rentman.net/contacts?name=${encodeURIComponent(q)}&limit=5`, {
      headers: {
        'Authorization': `Bearer ${RENTMAN_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Rentman API error');

    const json = await res.json();
    
    // Return formatted suggestions
    const suggestions = json.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      address: c.mailing_street || '',
      city: c.mailing_city || '',
      postalCode: c.mailing_postalcode || ''
    }));

    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error('[Location Search Error]:', error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}
