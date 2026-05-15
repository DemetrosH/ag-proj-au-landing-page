import { NextResponse } from 'next/server';
import { getProjectRequestById, getProjectById, rentmanFetch } from '../../../../lib/rentman';
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
              
              const normalizeStatus = (raw: any): string | number => {
                if (!raw) return '';
                if (typeof raw === 'object') {
                  return raw.name || raw.id || '';
                }
                return raw;
              };

              let requestStatusRaw = rData.status;
              let projectStatusRaw = null;
              
              if (rData.linked_project || rData.project) {
                try {
                  const projectPath = rData.linked_project || rData.project;
                  const projectId = projectPath.split('/').pop();
                  const projectData = await getProjectById(projectId);
                  if (projectData) {
                    const pData = projectData.data || projectData;
                    if (pData.status !== undefined && pData.status !== null) {
                      projectStatusRaw = pData.status;
                      rStatusRaw = pData.status;
                    } else {
                      // Rentman API v4 sometimes omits status from the project object itself.
                      // We must fetch the subprojects to get the real status.
                      try {
                        const subs: any = await rentmanFetch(`/projects/${projectId}/subprojects`);
                        const subData = subs.data || subs;
                        if (Array.isArray(subData) && subData.length > 0) {
                          const firstSub = subData[0];
                          if (firstSub.status) {
                            // firstSub.status is often a string like "/statuses/3"
                            const statusIdStr = typeof firstSub.status === 'string' ? firstSub.status.split('/').pop() : firstSub.status;
                            const statusId = parseInt(statusIdStr, 10);
                            
                            // 2: Annulé (Denied)
                            // 3,4,5,6: Confirmé, Prêt, Sur site, Retour (Confirmed)
                            // 1,7,8: Option, Demande, Concept (Pending)
                            let mappedSubStatus = 'pending';
                            if (statusId === 2) mappedSubStatus = 'denied';
                            else if ([3, 4, 5, 6].includes(statusId)) mappedSubStatus = 'confirmed';
                            else if ([1, 7, 8].includes(statusId)) mappedSubStatus = 'pending';

                            projectStatusRaw = { id: statusId, raw: firstSub.status, mapped: mappedSubStatus };
                            rStatusRaw = mappedSubStatus; // Feed this clean string into the downstream logic
                          }
                        }
                      } catch (subErr) {
                         console.error(`[Sync Warning] Failed to fetch subprojects for project ${projectId}:`, subErr);
                      }
                    }
                  }
                } catch (pErr) {
                  console.error(`[Sync Warning] Failed to fetch linked project for request ${rid}:`, pErr);
                }
              }

              const normalizedRaw = normalizeStatus(rStatusRaw);
              const s = typeof normalizedRaw === 'string' ? normalizedRaw.toLowerCase() : normalizedRaw;
              
              console.log(`[Sync Trace] RID: ${rid}`);
              console.log(`  - Request Status (raw):`, requestStatusRaw);
              console.log(`  - Project Status (raw):`, projectStatusRaw);
              console.log(`  - Final Normalized:`, s);
              
              // Priority mapping
              // 1. Denied/Cancelled (High priority)
              if ([2, 'denied', 'cancelled', 'canceled', 'annulé', 'annulée', 'refused'].includes(s)) {
                status = 'denied';
              } 
              // 2. Pending/Accepted/Converted (Accepted means project created but not yet confirmed)
              else if ([1, 7, 8, 'pending', 'concept', 'option', 'demande', 'inquiry', 'open', 'draft', 'accepted', 'converted'].includes(s)) {
                status = 'pending';
              } 
              // 3. Confirmed/Active statuses
              else if ([3, 4, 5, 6, 'confirmed', 'confirmé', 'prêt', 'ready', 'en location', 'in use', 'retour', 'returned'].includes(s)) {
                status = 'confirmed';
              } 
              // 4. Catch-all for string-based confirmations
              else if (typeof s === 'string' && (s.includes('confirmed') || s.includes('confirmé'))) {
                status = 'confirmed';
              }
              
              console.log(`  - Mapped to:`, status);
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
