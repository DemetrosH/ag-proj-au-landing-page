import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!id) {
    return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // For now, we fetch the synced stock_level from our database.
    // In a future phase, we can call Rentman's availability API if a date range is provided.
    const { data, error } = await supabase
      .from('products')
      .select('stock_level, availability_status')
      .eq('rentman_id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      id,
      available: data?.stock_level || 0,
      status: data?.availability_status || 'unknown'
    });
  } catch (error: any) {
    console.error('[Availability API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
