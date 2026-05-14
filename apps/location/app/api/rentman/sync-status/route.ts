import { NextResponse } from 'next/server';
import { getProjectRequestById } from '../../../../lib/rentman';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { requestIds } = await request.json();
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json({ statuses: {} });
    }

    const supabase = await createClient();
    const statusMap: Record<string, string> = {};

    // Fetch statuses for each ID
    // We do this in parallel to be faster
    const syncResults = await Promise.all(
      requestIds.map(async (rid) => {
        try {
          const rentmanData = await getProjectRequestById(rid);
          
          // Rentman Project Request statuses can vary, but generally:
          // 0: New/Pending
          // 1: Accepted/Converted
          // 2: Denied/Cancelled
          // Note: Actual values might depend on custom Rentman config
          let status = 'pending';
          
          // If we found the request, we can map its status
          // In some versions, 'status' is a number, in others it might be a string
          if (rentmanData) {
             // Basic mapping example (adjust if needed)
             if (rentmanData.status === 1 || rentmanData.status === 'Accepted') {
               status = 'accepted';
             } else if (rentmanData.status === 2 || rentmanData.status === 'Denied') {
               status = 'denied';
             } else if (rentmanData.status === 3 || rentmanData.status === 'Converted') {
               status = 'converted';
             }
          }

          // Update Supabase in the background if status changed
          // This ensures the DB stays semi-synced
          await supabase
            .from('soumissions')
            .update({ status: status })
            .eq('rentman_id', String(rid));

          return { id: rid, status };
        } catch (err) {
          console.error(`Error syncing status for Rentman ID ${rid}:`, err);
          return { id: rid, status: 'unknown' };
        }
      })
    );

    syncResults.forEach(res => {
      statusMap[res.id] = res.status;
    });

    return NextResponse.json({ statuses: statusMap });

  } catch (error: any) {
    console.error('[Sync Status API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
