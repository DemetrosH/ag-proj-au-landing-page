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

              // Normalize the status: Rentman can return it as a number, a string, 
              // or an object { id: number, name: string }
              const normalizeStatus = (raw: any): string | number => {
                if (!raw) return '';
                if (typeof raw === 'object') {
                  return raw.name || raw.id || '';
                }
                return raw;
              };

              const normalizedRaw = normalizeStatus(rStatusRaw);
              const s = typeof normalizedRaw === 'string' ? normalizedRaw.toLowerCase() : normalizedRaw;
              console.log(`[Sync Debug] Rentman ID ${rid} normalized status:`, s);
              
              // Expanded mapping based on Rentman Project Request and Project statuses
              // 1-2: Pending/Request
              // 3-6: Confirmed/Ready/In Use/Returned (all represent a 'confirmed' transaction)
              // 7-8: Cancelled/Denied
              if ([1, 2, 'concept', 'option', 'demande', 'inquiry', 'open', 'draft', 'pending'].includes(s)) {
                status = 'pending';
              } else if ([3, 4, 5, 6, 'confirmed', 'confirmé', 'accepted', 'prêt', 'ready', 'en location', 'in use', 'retour', 'returned', 'converted'].includes(s)) {
                status = 'confirmed';
              } else if ([7, 8, 'cancelled', 'canceled', 'annulé', 'annulée', 'denied', 'refused'].includes(s)) {
                status = 'denied';
              } else if (typeof s === 'string' && s.includes('confirmed')) {
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
