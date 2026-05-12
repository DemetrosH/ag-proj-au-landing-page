import { createAdminClient } from './supabase/admin';
import { 
  rentmanFetchAll, 
  getFilesLookup, 
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
    // 1. Fetch everything from Rentman in parallel
    const [allEquipment, folders, filesLookup, categories] = await Promise.all([
      rentmanFetchAll<any>('/equipment'),
      rentmanFetchAll<any>('/folders'),
      getFilesLookup(),
      getCategories()
    ]);

    console.log(`[Sync] Fetched ${allEquipment.length} items, ${folders.length} folders, and ${Object.keys(filesLookup.fileIdToUrl).length} images.`);

    // 2. Sync Categories
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

    // 3. Sync Products
    console.log('[Sync] Processing products...');
    
    // Prepare folder lookup for faster category matching
    const folderLookup: Record<string, any> = {};
    folders.forEach(f => {
      folderLookup[String(f.id)] = f;
    });

    const productsToUpsert = allEquipment
      .filter(item => item.in_shop) // Only sync items marked for shop
      .map(item => {
        // Resolve Category Slug
        let categorySlug: string | null = null;
        
        // Strategy A: Folder matching
        const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
        if (itemFolderId && folderLookup[itemFolderId]) {
          const folder = folderLookup[itemFolderId];
          const matchingCat = categories.find(c => {
            const catName = c.name.toLowerCase().trim();
            const folderName = folder.name.toLowerCase().trim();
            return folderName === catName || 
                   folderName === `${catName}-ws` || 
                   folderName === `${catName} - ws` ||
                   folder.path.toLowerCase().includes(`/${catName}/`);
          });
          if (matchingCat) categorySlug = matchingCat.slug;
        }

        // Strategy B: Product Mapping fallback
        if (!categorySlug) {
          const itemNameLower = item.name.toLowerCase().trim();
          const mappedCats = (wcData.productMapping as any)[itemNameLower];
          if (mappedCats && mappedCats.length > 0) {
            const firstMapped = categories.find(c => c.name === mappedCats[0]);
            if (firstMapped) categorySlug = firstMapped.slug;
          }
        }

        // Resolve Image
        const fileId = item.image ? item.image.split('/').pop() : null;
        let imageUrl = fileId ? filesLookup.fileIdToUrl[fileId] : '';

        // Fallback to linked files if primary is missing
        if (!imageUrl && item.id && filesLookup.itemIdToUrl[String(item.id)]) {
          imageUrl = filesLookup.itemIdToUrl[String(item.id)];
        }

        return {
          rentman_id: String(item.id),
          name: item.name,
          slug: String(item.id), // Using ID as slug for Rentman items
          price: item.price || 0,
          description: item.shop_description_long || item.shop_description_short || item.description || '',
          image_url: imageUrl || '',
          category_slug: categorySlug,
          is_featured: !!item.shop_featured,
          tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
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

    console.log('[Sync] Synchronization successful!');
    return { success: true, count: productsToUpsert.length };
  } catch (error) {
    console.error('[Sync] Synchronization failed:', error);
    return { success: false, error };
  }
}
