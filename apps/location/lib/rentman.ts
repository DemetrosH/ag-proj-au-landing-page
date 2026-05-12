/**
 * Rentman API Utility & Product Mapping
 */

const RENTMAN_BASE_URL = 'https://api.rentman.net';
const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

// Import WooCommerce mapping data
import wcData from '../data/wc-data.json';
import { UserRole, URBA_ACCESS_RULES } from './access-control';
import { createClient } from './supabase/server';

export interface RentmanProduct {
  id: string | number;
  name: string;
  folder_id?: string | number;
  tags?: string;
  price?: number;
  description?: string;
  in_shop: boolean;
  shop_featured: boolean;
  shop_description_short?: string;
  shop_description_long?: string;
  shop_seo_title?: string;
  shop_seo_keyword?: string;
  shop_seo_description?: string;
  remarks?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  features: string[];
  isFeatured: boolean;
  stock_level?: number;
  availability_status?: string;
  accessories?: Product[];
  specifications?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  previewImages?: string[];
  products?: Product[];
}

export interface RentmanFolder {
  id: number;
  name: string;
  displayname: string;
  parent: string | null;
  path: string;
}

/**
 * Generic fetch wrapper for Rentman API
 */
export async function rentmanFetch<T>(endpoint: string, options: any = {}): Promise<T> {
  if (!RENTMAN_API_TOKEN || RENTMAN_API_TOKEN === 'YOUR_RENTMAN_API_TOKEN') {
    throw new Error('Rentman API Token is not configured');
  }

  const url = new URL(`${RENTMAN_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(`${key}[]`, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Authorization': `Bearer ${RENTMAN_API_TOKEN}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Rentman API Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Fetches all folders from Rentman
 */
async function getFolders(): Promise<RentmanFolder[]> {
  try {
    return await rentmanFetch<RentmanFolder[]>('/folders', { params: { limit: 1000 } });
  } catch (error) {
    console.error('Failed to fetch Rentman folders:', error);
    return [];
  }
}

/**
 * Fetches all categories from the local sync data
 */
export async function getCategories(): Promise<Category[]> {
  // Map slugs and names, filtering out meta categories if needed
  return wcData.categories
    .filter(cat => cat.name !== 'Uncategorized' && cat.name !== 'Populaire' && cat.name !== 'Produits vedette')
    .map(cat => ({
      id: String(cat.id),
      name: cat.name.replace('&amp;', '&'),
      slug: cat.slug,
      description: cat.description
    }));
}

/**
 * Helper to fetch all pages of a Rentman endpoint
 */
export async function rentmanFetchAll<T>(endpoint: string, params: any = {}): Promise<T[]> {
  const allData: T[] = [];
  const limit = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await rentmanFetch<any>(endpoint, { params: { ...params, limit, offset } });
    const data = result.data || result;
    
    if (!Array.isArray(data) || data.length === 0) {
      hasMore = false;
      break;
    }

    allData.push(...data);

    if (data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
    
    if (offset > 50000) break; // Safety
  }
  return allData;
}

/**
 * Fetches availability for a list of equipment IDs for a specific period
 */
export async function getEquipmentAvailability(ids: string[], start: string, end: string): Promise<Record<string, number>> {
  try {
    const availabilityMap: Record<string, number> = {};
    
    // Batch in groups of 50 to avoid URL length limits
    const batchSize = 50;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      
      const result = await rentmanFetch<any>('/equipment/availability', { 
        params: { 
          equipment: batch, 
          start, 
          end 
        } 
      });

      const data = result.data || result;
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          // Rentman returns availability per day. We'll take the minimum availability in the period.
          // Or if we just check for "today", it will be one entry.
          const equipmentId = String(item.equipment);
          const quantity = item.quantity !== undefined ? Number(item.quantity) : 0;
          
          if (availabilityMap[equipmentId] === undefined || quantity < availabilityMap[equipmentId]) {
            availabilityMap[equipmentId] = quantity;
          }
        });
      }
    }
    
    return availabilityMap;
  } catch (error) {
    console.error('Failed to fetch Rentman availability:', error);
    return {};
  }
}

/**
 * Fetch products from Supabase with optional category filtering
 */
async function getProductsFromDb(options: { 
  categorySlug?: string, 
  limit?: number, 
  isFeatured?: boolean,
  role?: UserRole 
} = {}): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const rules = URBA_ACCESS_RULES[options.role || 'guest'];
    
    let query = supabase
      .from('products')
      .select('*');

    if (options.categorySlug) {
      query = query.eq('category_slug', options.categorySlug);
    }
    
    if (options.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .filter(p => !p.tags?.some((tag: string) => rules.hideTags.includes(tag)))
      .map(p => ({
        id: p.rentman_id,
        name: p.name,
        slug: p.slug,
        categoryId: p.category_slug || 'unknown',
        price: p.price,
        description: p.description,
        image: p.image_url,
        features: (p.tags || []).filter((tag: string) => !['location a', 'location b', 'location c', 'location-a', 'location-b', 'location-c', 'populaire', 'produits-vedette', 'uncategorized', 'has-accessories'].includes(tag.toLowerCase())),
        isFeatured: p.is_featured,
        stock_level: p.stock_level,
        availability_status: p.availability_status,
        specifications: p.specifications
      }));
  } catch (e) {
    console.error('[Supabase] Fetch error:', e);
    return [];
  }
}

/**
 * Enhanced getCategories for Home Page with product previews
 */
export async function getHomeCategories(role: UserRole = 'guest'): Promise<Category[]> {
  const rules = URBA_ACCESS_RULES[role];
  const categories = await getCategories();
  const allowedCategories = categories.filter(cat => !rules.hideCats.includes(cat.slug));
  
  // 1. Try DB first
  const dbProducts = await getProductsFromDb({ role });
  if (dbProducts.length > 0) {
    return allowedCategories.map(cat => {
      const categoryProducts = dbProducts.filter(p => p.categoryId === cat.slug);
      const previewImages = categoryProducts
        .map(p => p.image)
        .filter((img, i, self) => img && self.indexOf(img) === i)
        .slice(0, 4);

      return {
        ...cat,
        productCount: categoryProducts.length,
        previewImages,
        products: categoryProducts.slice(0, 100)
      };
    }).filter(cat => (cat as any).productCount > 0);
  }

  // 2. Fallback to Rentman
  console.log('[Rentman] DB is empty, falling back to direct API...');
  const [allEquipment, folders, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment'),
    rentmanFetchAll<any>('/folders'),
    getFilesLookup()
  ]);

  const results = allowedCategories.map(cat => {
    const targetFolderIds = folders
      .filter(f => {
        const folderName = f.name.toLowerCase().trim();
        const catName = cat.name.toLowerCase().trim();
        return folderName === catName || folderName === `${catName}-ws` || f.path.toLowerCase().includes(`/${catName}/`);
      })
      .map(f => String(f.id));

    const categoryProducts = allEquipment
      .filter(item => {
        if (!item.in_shop) return false;
        const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
        if (itemFolderId && targetFolderIds.includes(String(itemFolderId))) return true;
        const itemNameLower = item.name.toLowerCase().trim();
        const mappedCategories = (wcData.productMapping as any)[itemNameLower];
        const isInCategory = mappedCategories && mappedCategories.includes(cat.name);
        if (!isInCategory) return false;
        const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
        return !itemTags.some((tag: string) => rules.hideTags.includes(tag));
      })
      .map(item => mapRentmanToProduct(item, cat.slug, filesLookup));

    const previewImages = categoryProducts
      .map(p => p.image)
      .filter((img, i, self) => img && self.indexOf(img) === i)
      .slice(0, 4);

    return {
      ...cat,
      productCount: categoryProducts.length,
      previewImages,
      products: categoryProducts.slice(0, 10)
    };
  });

  return results.filter(cat => (cat as any).productCount > 0);
}

export interface FilesLookup {
  fileIdToUrl: Record<string, string>;
  itemIdToUrl: Record<string, string>;
}

/**
 * Fetches all files and returns a lookup map of file ID -> public URL
 * and item ID -> public URL (for items with missing primary images)
 * Uses pagination to ensure all files are retrieved.
 */
export async function getFilesLookup(): Promise<FilesLookup> {
  try {
    const fileIdToUrl: Record<string, string> = {};
    const itemIdToUrl: Record<string, string> = {};
    const limit = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await rentmanFetch<any>('/files', { params: { limit, offset } });
      const files = result.data || result;
      
      if (!Array.isArray(files) || files.length === 0) {
        hasMore = false;
        break;
      }

      files.forEach(file => {
        if (file.url) {
          fileIdToUrl[String(file.id)] = file.url;
          
          // If this file is linked to an equipment item and is an image, index it by item ID.
          // NOTE: file.item is a plain integer (e.g. 1332), NOT a path string.
          // file.itemtype === 'Materiaal' identifies equipment (as opposed to crew, state, etc.)
          if (
            file.item &&
            file.itemtype === 'Materiaal' &&
            (file.type?.startsWith('image/') || file.extension?.match(/jpg|jpeg|png|webp|gif/i))
          ) {
            const itemId = String(file.item); // already a plain integer
            if (itemId && !itemIdToUrl[itemId]) {
              itemIdToUrl[itemId] = file.url;
            }
          }
        }
      });

      if (files.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
      
      // Safety break to prevent infinite loops
      if (offset > 100000) break; 
    }
    
    console.log(`[Rentman] Built files lookup with ${Object.keys(fileIdToUrl).length} images and ${Object.keys(itemIdToUrl).length} item fallbacks`);
    return { fileIdToUrl, itemIdToUrl };
  } catch (error) {
    console.error('Failed to fetch Rentman files:', error);
    return { fileIdToUrl: {}, itemIdToUrl: {} };
  }
}

/**
 * Maps a Rentman item to our local Product schema
 */
export function mapRentmanToProduct(item: any, categoryId: string, filesLookup: FilesLookup = { fileIdToUrl: {}, itemIdToUrl: {} }): Product {
  // Strategy 1: Primary Image field
  let imageUrl = '';
  if (item.image) {
    const imgStr = String(item.image);
    if (imgStr.startsWith('http')) {
      imageUrl = imgStr;
    } else {
      const fileId = imgStr.split('/').pop();
      imageUrl = fileId ? filesLookup.fileIdToUrl[fileId] : '';
    }
  }

  // Strategy 2: Fallback to linked files if primary is missing
  if (!imageUrl && item.id && filesLookup.itemIdToUrl[String(item.id)]) {
    imageUrl = filesLookup.itemIdToUrl[String(item.id)];
  }

  return {
    id: String(item.id),
    name: item.name,
    slug: item.id.toString(),
    categoryId,
    price: item.price || 0,
    description: item.shop_description_long || item.shop_description_short || item.description || '',
    image: imageUrl || '',
    features: item.tags 
      ? item.tags.split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => !['location a', 'location b', 'location c', 'location-a', 'location-b', 'location-c', 'populaire', 'produits-vedette', 'uncategorized', 'has-accessories'].includes(t.toLowerCase()))
      : [],
    isFeatured: !!item.shop_featured,
  };
}

/**
 * Fetch general equipment (all categories)
 */
export async function getEquipment(limit = 100, role: UserRole = 'guest'): Promise<Product[]> {
  const dbProducts = await getProductsFromDb({ limit, role });
  if (dbProducts.length > 0) return dbProducts;

  const rules = URBA_ACCESS_RULES[role];
  const [allEquipment, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment', { limit }),
    getFilesLookup()
  ]);
  
  return allEquipment
    .filter(item => {
      if (!item.in_shop) return false;
      const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
      return !itemTags.some((tag: string) => rules.hideTags.includes(tag));
    })
    .map(item => mapRentmanToProduct(item, 'general', filesLookup));
}

/**
 * Fetch all equipment and filter by category slug
 */
export async function getProductsForCategory(categorySlug: string, role: UserRole = 'guest'): Promise<Product[]> {
  const dbProducts = await getProductsFromDb({ categorySlug, role });
  if (dbProducts.length > 0) return dbProducts;

  const rules = URBA_ACCESS_RULES[role];
  const category = wcData.categories.find(c => c.slug === categorySlug);
  if (!category) return [];

  const [allEquipment, folders, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment'),
    rentmanFetchAll<any>('/folders'),
    getFilesLookup()
  ]);
  
  const targetFolderIds = folders
    .filter(f => {
      const folderName = f.name.toLowerCase().trim();
      const catName = category.name.toLowerCase().trim();
      return folderName === catName || folderName === `${catName}-ws` || f.path.toLowerCase().includes(`/${catName}/`);
    })
    .map(f => String(f.id));

  return allEquipment.filter(item => {
    if (!item.in_shop) return false;
    const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
    const itemNameLower = item.name.toLowerCase().trim();
    const mappedCategories = (wcData.productMapping as any)[itemNameLower];
    const isInCategory = (itemFolderId && targetFolderIds.includes(String(itemFolderId))) || (mappedCategories && mappedCategories.includes(category.name));
    if (!isInCategory) return false;
    const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
    return !itemTags.some((tag: string) => rules.hideTags.includes(tag));
  }).map(item => mapRentmanToProduct(item, categorySlug, filesLookup));
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string, role: UserRole = 'guest'): Promise<Product | null> {
  const supabase = await createClient();
  const { data: p, error } = await supabase.from('products').select('*').eq('rentman_id', id).single();

  if (p && !error) {
    const rules = URBA_ACCESS_RULES[role];
    if (p.tags?.some((tag: string) => rules.hideTags.includes(tag))) return null;
    return {
      id: p.rentman_id,
      name: p.name,
      slug: p.slug,
      categoryId: p.category_slug || 'unknown',
      price: p.price,
      description: p.description,
      image: p.image_url,
      features: (p.tags || []).filter((tag: string) => !['location a', 'location b', 'location c', 'location-a', 'location-b', 'location-c', 'populaire', 'produits-vedette', 'uncategorized', 'has-accessories'].includes(tag.toLowerCase())),
      isFeatured: p.is_featured,
      stock_level: p.stock_level,
      availability_status: p.availability_status
    };
  }

  const rules = URBA_ACCESS_RULES[role];
  const item = await rentmanFetch<any>(`/equipment/${id}`);
  if (!item || !item.in_shop) return null;
  const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
  if (itemTags.some((tag: string) => rules.hideTags.includes(tag))) return null;

  const fileId = item.image ? item.image.split('/').pop() : null;
  let imageUrl = '';
  if (fileId) {
    try {
      const file = await rentmanFetch<any>(`/files/${fileId}`);
      imageUrl = file?.url || '';
    } catch (e) {}
  }

  return {
    ...mapRentmanToProduct(item, 'unknown'),
    image: imageUrl || ''
  };
}

/**
 * Fetch accessories for a specific equipment item
 */
export async function getAccessories(id: string, role: UserRole = 'guest'): Promise<Product[]> {
  try {
    // In Rentman API v2, accessories are often fetched via /equipment/{id}/accessories
    // If that doesn't work, we might need to check if they are in the equipment object itself
    const result = await rentmanFetch<any>(`/equipment/${id}/accessories`);
    const data = result.data || result;
    
    if (!Array.isArray(data)) return [];

    // Get the actual equipment IDs for the accessories
    // The Rentman response usually has a link to the equipment item
    const accessoryIds = data
      .map((acc: any) => {
        // Some responses have 'equipment', others might have 'item' or similar
        const eqId = acc.equipment || acc.item;
        return eqId ? String(eqId).split('/').pop() : null;
      })
      .filter((id): id is string => id !== null);
    
    if (accessoryIds.length === 0) return [];

    // Fetch the full details for each accessory
    // We try to get them from Supabase first for performance
    const accessories = await Promise.all(
      accessoryIds.slice(0, 10).map(accId => getProductById(accId, role))
    );

    return accessories.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error(`Failed to fetch accessories for product ${id}:`, error);
    return [];
  }
}
