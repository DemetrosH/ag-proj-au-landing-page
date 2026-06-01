import { NextResponse } from 'next/server';
import { syncRentmanToSupabase } from '../../../lib/sync';
import { getUserRole } from '../../../lib/auth';

/**
 * API Route to trigger Rentman synchronization
 * Protected by admin check or a secret token
 */
export async function GET(request: Request) {
  // Check for secret token or admin role
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  const role = await getUserRole();
  const isCron = secret === process.env.CRON_SECRET;
  
  if (role !== 'admin' && !isCron) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const source = isCron ? 'cron' : 'manual';
  const result = await syncRentmanToSupabase(source);
  const duration = (Date.now() - startTime) / 1000;

  if (result.success) {
    return NextResponse.json({ 
      message: 'Synchronization successful', 
      count: result.count,
      duration: `${duration}s`
    });
  } else {
    return NextResponse.json({ 
      message: 'Synchronization failed', 
      error: result.error 
    }, { status: 500 });
  }
}
