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
    
    // 1. Fetch physical total stock level from Supabase products table
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_level, availability_status')
      .eq('rentman_id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const totalPhysical = product.stock_level ?? 0;

    // 2. Resolve start & end dates: default to "today" (current moment to tomorrow at same time) if missing
    const today = new Date();
    const defaultStart = today.toISOString();
    const defaultEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const startDateStr = start || defaultStart;
    const endDateStr = end || defaultEnd;

    // 3. Query overlapping allocations for this equipment ID
    // Two intervals [A_start, A_end] and [B_start, B_end] overlap if A_start < B_end AND A_end > B_start
    const { data: allocations, error: allocError } = await supabase
      .from('rentman_allocations')
      .select('quantity, planperiod_start, planperiod_end')
      .eq('equipment_id', id)
      .lt('planperiod_start', endDateStr)
      .gt('planperiod_end', startDateStr);

    let peakAllocation = 0;

    if (allocError) {
      // If table is not created yet, log a warning and fall back to 0 allocations (static stock)
      if (allocError.message?.includes('relation') || allocError.message?.includes('does not exist')) {
        console.warn(`[Availability API] 'rentman_allocations' table is missing. Run migration 'supabase/migrations/20260522000001_create_rentman_allocations.sql'.`);
      } else {
        console.error('[Availability API] Error querying allocations:', allocError.message);
      }
    } else if (allocations && allocations.length > 0) {
      // 4. Calculate peak concurrent allocation
      peakAllocation = calculatePeakAllocation(allocations, startDateStr, endDateStr);
    }

    // 5. Calculate remaining available quantity
    const availableQty = Math.max(0, totalPhysical - peakAllocation);
    const status = availableQty > 0 ? 'available' : 'out_of_stock';

    return NextResponse.json({
      id,
      available: availableQty,
      total: totalPhysical,
      peak_allocated: peakAllocation,
      status,
      dates_defaulted: !start && !end,
      start: startDateStr,
      end: endDateStr
    });
  } catch (error: any) {
    console.error('[Availability API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

/**
 * Calculates the maximum concurrent quantity of equipment allocated during the requested period.
 */
function calculatePeakAllocation(
  allocations: Array<{ quantity: number; planperiod_start: string; planperiod_end: string }>,
  userStart: string,
  userEnd: string
): number {
  const startRange = new Date(userStart).getTime();
  const endRange = new Date(userEnd).getTime();

  // Collect all boundary events within the requested range
  const timePointsSet = new Set<number>();
  timePointsSet.add(startRange);
  timePointsSet.add(endRange);

  for (const alloc of allocations) {
    const s = new Date(alloc.planperiod_start).getTime();
    const e = new Date(alloc.planperiod_end).getTime();

    if (s > startRange && s < endRange) {
      timePointsSet.add(s);
    }
    if (e > startRange && e < endRange) {
      timePointsSet.add(e);
    }
  }

  const timePoints = Array.from(timePointsSet).sort((a, b) => a - b);
  let maxAllocation = 0;

  // Step through each unique sub-interval
  for (let i = 0; i < timePoints.length - 1; i++) {
    const tStart = timePoints[i];
    const tEnd = timePoints[i + 1];
    if (tStart === undefined || tEnd === undefined) continue;
    const midTime = (tStart + tEnd) / 2;

    // Sum all allocations active during this sub-interval
    let currentSum = 0;
    for (const alloc of allocations) {
      const s = new Date(alloc.planperiod_start).getTime();
      const e = new Date(alloc.planperiod_end).getTime();

      if (midTime >= s && midTime <= e) {
        currentSum += alloc.quantity || 0;
      }
    }

    if (currentSum > maxAllocation) {
      maxAllocation = currentSum;
    }
  }

  return maxAllocation;
}

