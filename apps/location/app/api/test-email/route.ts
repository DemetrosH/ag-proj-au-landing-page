import { NextResponse } from 'next/server';
import { sendContactEmail } from '../../../lib/mail';

export async function GET() {
  try {
    const result = await sendContactEmail({
      name: 'Test Antigravity',
      email: 'test@example.com',
      phone: '555-555-5555',
      message: 'Ceci est un test de la configuration Resend.'
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully!',
        data: result.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send test email.',
        error: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: 'An unexpected error occurred.',
      error: error.message 
    }, { status: 500 });
  }
}
