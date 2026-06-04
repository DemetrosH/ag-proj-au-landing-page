import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify that the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // 2. Fetch all submissions for sales analysis
    const { data: submissions, error: subError } = await supabase
      .from('soumissions')
      .select('id, total_price, status, items, created_at');

    if (subError) {
      return NextResponse.json({ error: 'Failed to query submissions: ' + subError.message }, { status: 500 });
    }

    const subList = submissions || [];
    
    // Aggregate Sales Stats
    const totalCount = subList.length;
    let totalValue = 0;
    let confirmedValue = 0;
    let pendingValue = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let deniedCount = 0;
    
    // Aggregates for products and categories
    const productStats: Record<string, { name: string; count: number; totalRevenue: number; image?: string }> = {};
    const categoryStats: Record<string, { name: string; count: number }> = {};

    subList.forEach((sub) => {
      const price = Number(sub.total_price) || 0;
      totalValue += price;
      
      const status = sub.status || 'pending';
      if (status === 'confirmed') {
        confirmedCount++;
        confirmedValue += price;
      } else if (status === 'denied') {
        deniedCount++;
      } else {
        pendingCount++;
        pendingValue += price;
      }

      // Parse items
      const items = Array.isArray(sub.items) ? sub.items : [];
      items.forEach((item: any) => {
        const itemId = item.id || 'unknown';
        const itemName = item.name || 'Produit inconnu';
        const qty = Number(item.quantity) || 1;
        const itemPrice = (Number(item.price) || 0) * qty;

        // Product stats
        if (!productStats[itemId]) {
          productStats[itemId] = {
            name: itemName,
            count: 0,
            totalRevenue: 0,
            image: item.image || ''
          };
        }
        productStats[itemId].count += qty;
        productStats[itemId].totalRevenue += itemPrice;

        // Category stats
        const catId = item.categoryId || 'divers';
        if (!categoryStats[catId]) {
          categoryStats[catId] = {
            name: catId.charAt(0).toUpperCase() + catId.slice(1),
            count: 0
          };
        }
        categoryStats[catId].count += qty;
      });
    });

    const averageValue = totalCount > 0 ? Math.round(totalValue / totalCount) : 0;

    // Sort popular products
    const popularProducts = Object.values(productStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort popular categories
    const popularCategories = Object.entries(categoryStats)
      .map(([id, val]) => ({ id, name: val.name, count: val.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Fetch Sync Logs Stats
    const { data: syncLogs, error: logError } = await supabase
      .from('sync_logs')
      .select('id, status, duration_ms, created_at, source, error_message')
      .order('created_at', { ascending: false });

    const logsList = syncLogs || [];
    const totalSyncs = logsList.length;
    const successSyncs = logsList.filter(l => l.status === 'success').length;
    const errorSyncs = logsList.filter(l => l.status === 'error').length;
    
    // Average duration of successful syncs
    const successLogs = logsList.filter(l => l.status === 'success' && l.duration_ms);
    const avgDurationMs = successLogs.length > 0
      ? Math.round(successLogs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / successLogs.length)
      : 0;

    const latestSync = logsList.length > 0 ? logsList[0] : null;

    return NextResponse.json({
      sales: {
        totalCount,
        totalValue,
        confirmedCount,
        confirmedValue,
        pendingCount,
        pendingValue,
        deniedCount,
        averageValue,
        popularProducts,
        popularCategories
      },
      sync: {
        totalSyncs,
        successSyncs,
        errorSyncs,
        avgDurationMs,
        latestSync
      }
    });
  } catch (err: any) {
    console.error('Error getting analytics:', err);
    return NextResponse.json({ error: err.message || 'Une erreur est survenue' }, { status: 500 });
  }
}
