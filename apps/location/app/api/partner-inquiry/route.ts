import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/client';

// Simple in-memory rate limiting for the session (basic protection)
const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, message } = body;
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';

    // 1. Rate Limiting Check (Simple)
    const now = Date.now();
    const lastSubmission = rateLimit.get(ip);
    if (lastSubmission && now - lastSubmission < 1000 * 60 * 60) { // 1 hour limit
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Log or Store in Supabase
    const supabase = createClient();
    
    // We attempt to insert into partner_inquiries. 
    // If the table doesn't exist, we'll log it for manual action.
    const { error } = await supabase
      .from('partner_inquiries')
      .insert([
        { name, company, email, message }
      ]);

    if (error) {
      console.error('[Partner Inquiry Storage Error]:', error);
      // We don't fail the request yet, as we might want to still send an email or just log it
    }

    // 3. Update rate limit
    rateLimit.set(ip, now);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Partner Inquiry API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
