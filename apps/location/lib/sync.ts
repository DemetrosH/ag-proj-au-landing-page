import { createAdminClient } from './supabase/admin';
import { 
  rentmanFetchAll,
  rentmanFetch,
  getFilesLookup, 
  getFolders,
  getCategories
} from './rentman';
import { client as sanityClient } from './sanity';
import wcData from '../data/wc-data.json';

/**
 * Main synchronization function to mirror Rentman data to Supabase
 */
export async function syncRentmanToSupabase(source: string = 'manual') {
  const supabase = createAdminClient();
  const startTime = Date.now();
  console.log(`[Sync] Starting Rentman to Supabase synchronization (source: ${source})...`);
  
  let logId: string | null = null;

  try {
    // Log start to database
    const { data: logData, error: logError } = await supabase
      .from('sync_logs')
      .insert({ source, status: 'started' })
      .select('id')
      .single();
    
    if (logData && !logError) {
      logId = logData.id;
    }

    // 0. Fetch existing products to preserve images and stock levels if sync skips them
    const { data: existingProducts } = await supabase.from('products').select('rentman_id, image_url, stock_level');
    const existingData: Record<string, any> = {};
    existingProducts?.forEach(p => {
      existingData[p.rentman_id] = p;
    });

    // 1. Fetch everything from Rentman in parallel
    const [allEquipment, folders, filesLookup, categories] = await Promise.all([
      rentmanFetchAll<any>('/equipment'),
      getFolders(),
      getFilesLookup(),
      getCategories(supabase)
    ]);

    console.log(`[Sync] Fetched ${allEquipment.length} items, ${folders.length} folders, and ${Object.keys(filesLookup.fileIdToUrl).length} images.`);
    
    if (allEquipment.length === 0) {
      throw new Error('No equipment items returned from Rentman. Aborting sync to prevent data loss.');
    }

    // 2. We skip availability check because Rentman API v1 doesn't have a bulk availability endpoint in this format.
    // We use the item's base quantity (total owned) as the stock level.
    console.log('[Sync] Using base quantity as stock level...');
    // const availabilityMap = await getEquipmentAvailability(equipmentIds, today, today);
    const availabilityMap: Record<string, number> = {};

    // 3. Sync Categories
    console.log('[Sync] Upserting categories...');
    const categoriesToUpsert = categories.map(cat => ({
      rentman_id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      last_synced: new Date().toISOString()
    }));

    const { error: catError } = await supabase
      .from('categories')
      .upsert(categoriesToUpsert, { onConflict: 'rentman_id' });

    if (catError) throw catError;

    const productsToProcess = allEquipment.filter(item => item.in_shop);
    
    // Only fetch details for products that are NEW or out of stock to avoid Rentman API rate limits (429) and Vercel timeouts
    const forceFullFetch = source === 'manual_full';
    const needsFetch = productsToProcess.filter(item => {
      if (forceFullFetch) return true;
      const existing = existingData[String(item.id)];
      return !existing || typeof existing.stock_level !== 'number' || existing.stock_level === 0;
    });

    console.log(`[Sync] Fetching details for ${needsFetch.length} products (skipping ${productsToProcess.length - needsFetch.length} cached)...`);
    
    // Fetch individual details in batches to avoid overwhelming the API
    const fetchedDetails: any[] = [];
    const batchSize = 5;
    for (let i = 0; i < needsFetch.length; i += batchSize) {
      const batch = needsFetch.slice(i, i + batchSize);
      const details = await Promise.all(batch.map(async (item) => {
        try {
          // Use the rentmanFetch for singular item to get current_quantity
          const detail = await rentmanFetch<any>(`/equipment/${item.id}`);
          return { ...item, ...detail };
        } catch (e) {
          console.warn(`[Sync] Failed to fetch details for ${item.name} (${item.id}):`, e);
          return item; // Fallback to bulk data
        }
      }));
      fetchedDetails.push(...details);
      
      // Small delay to avoid rate limiting
      if (i + batchSize < needsFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`[Sync] Progress: ${Math.min(i + batchSize, needsFetch.length)}/${needsFetch.length}`);
    }

    const fetchedLookup = new Map(fetchedDetails.map(p => [p.id, p]));
    const fullProducts = productsToProcess.map(item => {
      if (fetchedLookup.has(item.id)) {
        return fetchedLookup.get(item.id);
      } else {
        const existingStock = existingData[String(item.id)]?.stock_level ?? 0;
        return { ...item, current_quantity: existingStock };
      }
    });

    // Prepare folder lookup for faster category matching
    const folderLookup: Record<string, any> = {};
    folders.forEach(f => {
      folderLookup[String(f.id)] = f;
    });

    const productsToUpsert = fullProducts
      .map(item => {
        // Resolve Category Slugs
        let categorySlugs = new Set<string>();
        
        // Strategy A: Folder matching
        const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
        if (itemFolderId && folderLookup[itemFolderId]) {
          const folder = folderLookup[itemFolderId];
          const matchingCats = categories.filter(c => {
            const catName = c.name.toLowerCase().trim();
            const folderName = folder.name.toLowerCase().trim();
            return folderName === catName || 
                   folderName === `${catName}-ws` || 
                   folderName === `${catName} - ws` ||
                   folder.path.toLowerCase().includes(`/${catName}/`);
          });
          matchingCats.forEach(c => categorySlugs.add(c.slug));
        }

        // Strategy B: Product Mapping fallback
        const itemNameLower = item.name.toLowerCase().trim();
        const mappedCats = (wcData.productMapping as any)[itemNameLower];
        if (mappedCats && mappedCats.length > 0) {
          // Clean &amp; in mapped names to match cleaned category names
          const cleanedMappedCats = mappedCats.map((name: string) => name.replace(/&amp;/g, '&'));
          const matchingMapped = categories.filter(c => cleanedMappedCats.includes(c.name));
          matchingMapped.forEach(c => categorySlugs.add(c.slug));
        }

        // For backward compatibility during migration
        const primaryCategory = Array.from(categorySlugs)[0] || null;

        // Resolve Image
        let imageUrl = '';
        if (item.image) {
          const imgStr = String(item.image);
          if (imgStr.startsWith('http')) {
            imageUrl = imgStr;
          } else {
            const fileId = imgStr.split('/').pop();
            imageUrl = (fileId ? filesLookup.fileIdToUrl[fileId] : '') || '';
          }
        }

        // Fallback to linked files if primary is missing
        if (!imageUrl && item.id && filesLookup.itemIdToUrl[String(item.id)]) {
          imageUrl = filesLookup.itemIdToUrl[String(item.id)] || '';
        }

        // Collect all images
        let images: string[] = [];
        if (item.id && filesLookup.itemIdToUrls[String(item.id)]) {
          images = [...(filesLookup.itemIdToUrls[String(item.id)] || [])];
        }
        
        // Ensure primary image is first
        if (imageUrl && !images.includes(imageUrl)) {
          images.unshift(imageUrl);
        } else if (imageUrl && images.includes(imageUrl)) {
          images = [imageUrl, ...images.filter(img => img !== imageUrl)];
        }

        const stockLevel = item.current_quantity ?? 0; // Use Rentman quantity

        if (!imageUrl && item.image) {
          console.warn(`[Sync] No image found for product ${item.name} (ID: ${item.id}, FileRef: ${item.image})`);
        }

        // Final Image fallback: keep existing if new is empty
        if (!imageUrl && existingData[String(item.id)]?.image_url) {
          imageUrl = existingData[String(item.id)].image_url || '';
        }

        return {
          rentman_id: String(item.id),
          name: item.name,
          slug: slugify(item.name) + '-' + String(item.id),
          price: item.price || 0,
          description: item.shop_description_long || item.shop_description_short || item.description || '',
          image_url: imageUrl || '',
          image_urls: images,
          category_slug: primaryCategory,
          category_slugs: Array.from(categorySlugs),
          is_featured: !!item.shop_featured,
          tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
          stock_level: stockLevel,
          availability_status: stockLevel > 0 ? 'available' : 'out_of_stock',
          specifications: item.remarks || '',
          last_synced: new Date().toISOString()
        };
      });

    console.log(`[Sync] Upserting ${productsToUpsert.length} products...`);
    
    // Split into chunks of 100 to avoid large payload errors
    const chunkSize = 100;
    for (let i = 0; i < productsToUpsert.length; i += chunkSize) {
      const chunk = productsToUpsert.slice(i, i + chunkSize);
      const { error: prodError } = await supabase
        .from('products')
        .upsert(chunk, { onConflict: 'rentman_id' });
      
      if (prodError) throw prodError;
    }

    // 3.5 Sync new products to Sanity categoryConfig
    try {
      console.log('[Sync] Updating Sanity categoryConfigs with new products...');
      // Group products by category_slug
      const productsByCategory: Record<string, any[]> = {};
      for (const p of productsToUpsert) {
        if (p.category_slug) {
          if (!productsByCategory[p.category_slug]) {
            productsByCategory[p.category_slug] = [];
          }
          productsByCategory[p.category_slug].push(p);
        }
      }

      for (const [catSlug, products] of Object.entries(productsByCategory)) {
        const docId = `category-config-${catSlug}`;
        
        let existingDoc: any = null;
        try {
          existingDoc = await sanityClient.getDocument(docId);
        } catch (err) {
          // ignore
        }
        let existingDraft: any = null;
        try {
          existingDraft = await sanityClient.getDocument(`drafts.${docId}`);
        } catch (err) {
          // ignore
        }

        const activeDoc = existingDraft || existingDoc;
        if (activeDoc) {
          const currentOrderedProducts = activeDoc.orderedProducts || [];
          const existingSlugs = new Set(currentOrderedProducts.map((p: any) => p.slug));
          
          const newOrderedProducts = products
            .filter((p: any) => !existingSlugs.has(p.slug))
            .map((p: any) => ({
              _key: `prod_${p.slug}_${Math.random().toString(36).substring(7)}`,
              _type: 'orderedProduct',
              name: p.name,
              slug: p.slug
            }));

          if (newOrderedProducts.length > 0) {
            console.log(`[Sync] Adding ${newOrderedProducts.length} new products to category: ${catSlug} in Sanity`);
            await sanityClient
              .patch(docId)
              .setIfMissing({ orderedProducts: [] })
              .append('orderedProducts', newOrderedProducts)
              .commit();
          }
        }
      }
      console.log('[Sync] Sanity update complete.');
    } catch (sanityErr) {
      console.error('[Sync] Failed to update Sanity categoryConfigs:', sanityErr);
    }

    // 4. Sync equipment allocations
    let allocationsCount = 0;
    try {
      const allocationResult = await syncRentmanAllocations(supabase);
      if (allocationResult.success) {
        allocationsCount = allocationResult.count || 0;
      }
    } catch (allocErr) {
      console.error('[Sync] Allocations sync failed but continuing with products:', allocErr);
    }

    console.log(`[Sync] Synchronization successful! Products: ${productsToUpsert.length}, Allocations: ${allocationsCount} (Ver 1.3)`);
    
    if (logId) {
      await supabase.from('sync_logs').update({
        status: 'success',
        duration_ms: Date.now() - startTime,
        items_processed: productsToUpsert.length
      }).eq('id', logId);
    }
    
    return { success: true, count: productsToUpsert.length, allocationsCount };
  } catch (error: any) {
    console.error('[Sync] Synchronization failed:', error);
    
    if (logId) {
      await supabase.from('sync_logs').update({
        status: 'error',
        duration_ms: Date.now() - startTime,
        error_message: error?.message || String(error)
      }).eq('id', logId);
    }
    
    return { success: false, error };
  }
}

/**
 * Synchronize project equipment allocations from Rentman to Supabase
 */
export async function syncRentmanAllocations(supabase: any) {
  console.log('[Sync] Starting Rentman allocations synchronization...');
  try {
    console.log('[Sync] Fetching all project equipment allocations from Rentman...');
    const allAllocations = await rentmanFetchAll<any>('/projectequipment');
    console.log(`[Sync] Fetched ${allAllocations.length} total allocations from Rentman.`);
    
    if (!Array.isArray(allAllocations)) {
      console.warn('[Sync] No allocations returned or invalid response format.');
      return { success: false, reason: 'Invalid allocations response' };
    }

    const today = new Date();
    // Keep allocations ending in the future (meaning they could affect future rentals)
    const futureAllocations = allAllocations.filter(a => {
      if (!a.planperiod_end) return false;
      return new Date(a.planperiod_end) >= today;
    });

    console.log(`[Sync] Found ${futureAllocations.length} active/future allocations to cache.`);

    // Map Rentman allocations to Supabase schema
    const allocationsToUpsert = futureAllocations.map(a => {
      // a.equipment is a string like "/equipment/1335" or a number.
      let equipmentId = '';
      if (typeof a.equipment === 'string') {
        equipmentId = a.equipment.split('/').pop() || '';
      } else if (a.equipment) {
        equipmentId = String(a.equipment);
      }

      return {
        id: Number(a.id),
        equipment_id: equipmentId,
        quantity: Number(a.quantity || 0),
        planperiod_start: a.planperiod_start,
        planperiod_end: a.planperiod_end,
        project_id: a.project ? String(a.project).split('/').pop() || null : null,
        last_synced: new Date().toISOString()
      };
    }).filter(a => a.equipment_id && a.id);

    console.log(`[Sync] Preparing to upsert ${allocationsToUpsert.length} allocations...`);

    // Upsert into public.rentman_allocations in Supabase
    const { error: upsertError } = await supabase
      .from('rentman_allocations')
      .upsert(allocationsToUpsert, { onConflict: 'id' });

    if (upsertError) {
      if (upsertError.message?.includes('relation') || upsertError.message?.includes('does not exist')) {
        console.error('========================================================================');
        console.error('[Sync Error] Database table "rentman_allocations" does NOT exist in Supabase!');
        console.error('Please run the migration SQL from the following file in your Supabase SQL Editor:');
        console.error('supabase/migrations/20260522000001_create_rentman_allocations.sql');
        console.error('========================================================================');
        return { success: false, error: 'Table does not exist. Run migration.' };
      }
      throw upsertError;
    }

    // Clean up stale past allocations from database
    const { error: deleteError } = await supabase
      .from('rentman_allocations')
      .delete()
      .lt('planperiod_end', today.toISOString());

    if (deleteError) {
      console.warn('[Sync] Failed to clean up stale allocations:', deleteError);
    } else {
      console.log('[Sync] Stale past allocations cleaned up successfully.');
    }

    console.log('[Sync] Allocations synchronized successfully!');
    return { success: true, count: allocationsToUpsert.length };
  } catch (error) {
    console.error('[Sync] Allocations synchronization failed:', error);
    return { success: false, error };
  }
}

/**
 * Standard utility to generate SEO-friendly clean textual slugs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Decompose combined graphemes into individual ones
    .replace(/[\u0300-\u036f]/g, '') // Remove accent diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-') // Collapse spaces into hyphens
    .replace(/-+/g, '-'); // Collapse double hyphens
}

