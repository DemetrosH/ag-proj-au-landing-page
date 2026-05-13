import { NextResponse } from 'next/server';
import { sendContactEmail } from '../../../lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sendContactEmail({ name, email, phone, message });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Contact API Error]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
