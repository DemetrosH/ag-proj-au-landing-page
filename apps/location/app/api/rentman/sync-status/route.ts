import { NextResponse } from 'next/server';
import { getProjectRequestById, getProjectById } from '../../../../lib/rentman';
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
              const rData = rentmanData.data || rentmanData;
              let rStatusRaw = rData.status;
              
              // If the project request is converted/accepted, try to look at the linked project
              // for more granular status updates (Concept, Option, Prêt, etc.)
              if (rData.linked_project || rData.project) {
                try {
                  const projectPath = rData.linked_project || rData.project;
                  const projectId = projectPath.split('/').pop();
                  console.log(`[Sync Debug] Request ${rid} is linked to project ${projectId}, fetching project status...`);
                  const projectData = await getProjectById(projectId);
                  if (projectData) {
                    const pData = projectData.data || projectData;
                    if (pData.status) {
                      rStatusRaw = pData.status;
                      console.log(`[Sync Debug] Using project status instead:`, rStatusRaw);
                    }
                  }
                } catch (pErr) {
                  console.error(`[Sync Warning] Failed to fetch linked project for request ${rid}:`, pErr);
                }
              }

              const rStatus = typeof rStatusRaw === 'string' ? rStatusRaw.toLowerCase() : rStatusRaw;
              console.log(`[Sync Debug] Rentman ID ${rid} effective status:`, rStatusRaw);
              
              // Expanded mapping based on Rentman Project Request and Project statuses
              if (rStatus === 1 || rStatus === 'concept' || rStatus === 'option' || rStatus === 'demande' || rStatus === 'inquiry' || rStatus === 'open') {
                status = 'pending';
              } else if (rStatus === 2 || rStatus === 'draft' || rStatus === 'pending') {
                status = 'pending';
              } else if (rStatus === 3 || rStatus === 'confirmed' || rStatus === 'confirmé' || rStatus === 'accepted' || rStatus === 'confirmed (draft)') {
                status = 'confirmed';
              } else if (rStatus === 4 || rStatus === 'prêt' || rStatus === 'ready' || rStatus === 5 || rStatus === 'en location' || rStatus === 'in use') {
                status = 'confirmed';
              } else if (rStatus === 6 || rStatus === 'retour' || rStatus === 'returned' || rStatus === 'converted') {
                status = 'confirmed';
              } else if (rStatus === 7 || rStatus === 8 || rStatus === 'cancelled' || rStatus === 'annulé' || rStatus === 'denied' || rStatus === 'refused') {
                status = 'denied';
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
