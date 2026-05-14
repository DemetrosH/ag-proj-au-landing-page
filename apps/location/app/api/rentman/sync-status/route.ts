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
             const rStatus = rentmanData.status;
             
             if (rStatus === 1 || rStatus === 'Inquiry') {
               status = 'inquiry';
             } else if (rStatus === 2 || rStatus === 'Draft') {
               status = 'draft';
             } else if (rStatus === 3 || rStatus === 'Pending') {
               status = 'pending';
             } else if (rStatus === 4 || rStatus === 'Confirmed' || rStatus === 'Accepted' || rStatus === 'Confirmed (Draft)') {
               status = 'confirmed';
             } else if (rStatus === 8 || rStatus === 'Cancelled' || rStatus === 'Denied') {
               status = 'denied';
             } else if (rStatus === 'Converted' || rStatus === 'Accepted') {
               status = 'confirmed';
             }
          }

          // Update Supabase in the background if status changed
          // We try both the direct column and the metadata fallback
          const { error: updateErr } = await supabase
            .from('soumissions')
            .update({ status: status })
            .eq('rentman_id', String(rid));

          if (updateErr && updateErr.message?.includes('column')) {
            // Fallback: search for the record where event_details contains the rentman_id
            // This is a bit slower but ensures sync works without the column
            await supabase
              .from('soumissions')
              .update({ status: status })
              .filter('event_details', 'ilike', `%"rentman_id":"${rid}"%`);
          }

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
