import { createAdminClient } from './supabase/admin';
import { 
  rentmanFetchAll,
  rentmanFetch,
  getFilesLookup, 
  getFolders,
  getCategories
} from './rentman';
import wcData from '../data/wc-data.json';

/**
 * Main synchronization function to mirror Rentman data to Supabase
 */
export async function syncRentmanToSupabase() {
  const supabase = createAdminClient();
  console.log('[Sync] Starting Rentman to Supabase synchronization...');

  try {
    // 0. Fetch existing products to preserve images if sync fails to find them
    const { data: existingProducts } = await supabase.from('products').select('rentman_id, image_url');
    const existingImages: Record<string, string> = {};
    existingProducts?.forEach(p => {
      existingImages[p.rentman_id] = p.image_url;
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
    console.log(`[Sync] Fetching details for ${productsToProcess.length} in-shop products to get accurate stock levels...`);
    
    // Fetch individual details in batches to avoid overwhelming the API
    const fullProducts: any[] = [];
    const batchSize = 5;
    for (let i = 0; i < productsToProcess.length; i += batchSize) {
      const batch = productsToProcess.slice(i, i + batchSize);
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
      fullProducts.push(...details);
      
      // Small delay to avoid rate limiting
      if (i + batchSize < productsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`[Sync] Progress: ${Math.min(i + batchSize, productsToProcess.length)}/${productsToProcess.length}`);
    }

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
        if (!imageUrl && existingImages[String(item.id)]) {
          imageUrl = existingImages[String(item.id)] || '';
        }

        return {
          rentman_id: String(item.id),
          name: item.name,
          slug: String(item.id), // Using ID as slug for Rentman items
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

    console.log('[Sync] Synchronization successful! (Ver 1.2)');
    return { success: true, count: productsToUpsert.length };
  } catch (error) {
    console.error('[Sync] Synchronization failed:', error);
    return { success: false, error };
  }
}
