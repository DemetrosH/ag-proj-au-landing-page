/**
 * Rentman API Utility & Product Mapping
 */

const RENTMAN_BASE_URL = 'https://api.rentman.net';

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
  images: string[];
  features: string[];
  isFeatured: boolean;
  stock_level?: number;
  availability_status?: string;
  accessories?: Product[];
  specifications?: string;
  category_slugs?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  no_index?: boolean;
  og_image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  previewImages?: string[];
  products?: Product[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  no_index?: boolean;
  og_image?: string;
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
  const token = process.env.RENTMAN_API_TOKEN;
  if (!token || token === 'YOUR_RENTMAN_API_TOKEN') {
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
    method: options.method || 'GET',
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Rentman API Error Body]: ${errorBody}`);
    throw new Error(`Rentman API Error: ${response.status} - ${errorBody}`);
  }

  const result = await response.json();
  return result.data || result;
}

/**
 * Fetches all folders from Rentman
 */
export async function getFolders(): Promise<RentmanFolder[]> {
  try {
    return await rentmanFetch<RentmanFolder[]>('/folders', { params: { limit: 1000 } });
  } catch (error) {
    console.error('Failed to fetch Rentman folders:', error);
    return [];
  }
}

/**
 * Fetches categories from Supabase (not Rentman, as we map them manually)
 */
export async function getCategories(providedSupabase?: any) {
  const supabase = providedSupabase || await createClient();
  const { data: dbCats } = await supabase.from('categories').select('*');

  // Map slugs and names, filtering out meta categories if needed
  return wcData.categories
    .filter(cat => cat.name !== 'Uncategorized' && cat.name !== 'Populaire' && cat.name !== 'Produits vedette')
    .map(cat => {
      const dbCat = dbCats?.find(c => c.slug === cat.slug);
      return {
        id: String(cat.id),
        name: cat.name.replace('&amp;', '&'),
        slug: cat.slug,
        description: cat.description,
        seo_title: dbCat?.seo_title,
        seo_description: dbCat?.seo_description,
        seo_keywords: dbCat?.seo_keywords,
        canonical_url: dbCat?.canonical_url,
        no_index: dbCat?.no_index,
        og_image: dbCat?.og_image
      };
    });
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
 * NOTE: The getEquipmentAvailability function has been removed.
 * The Rentman API v1/v2 does not support a bulk availability check endpoint via `/equipment/availability`.
 * If availability is strictly needed, it requires checking specific project allocations or querying via another module.
 * For now, items marked `in_shop` are assumed to be available.
 */

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
      query = query.contains('category_slugs', [options.categorySlug]);
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
      .filter(p => {
        // Hide if any hideTag is present
        if (p.tags?.some((tag: string) => rules.hideTags.includes(tag))) return false;
        
        // If requiredTags are specified, at least one must be present
        if (rules.requiredTags && rules.requiredTags.length > 0) {
          return p.tags?.some((tag: string) => rules.requiredTags?.includes(tag));
        }
        
        return true;
      })
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
        category_slugs: p.category_slugs,
        specifications: p.specifications,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        seo_keywords: p.seo_keywords,
        canonical_url: p.canonical_url,
        no_index: p.no_index,
        og_image: p.og_image
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
  
  const preferredOrder = [
    'alimentaire', 
    'chapiteaux', 
    'ameublements', 
    'rallongesmultiprises', 
    'sonorisation', 
    'enseigne-neon', 
    'video', 
    'scene', 
    'eclairage', 
    'signaletique', 
    'jeux', 
    'bloc-dalimentation-batteries', 
    'poids-support'
  ];

  // 1. Try DB first
  const dbProducts = await getProductsFromDb({ role });
  if (dbProducts.length > 0) {
    const results = allowedCategories.map(cat => {
      const categoryProducts = dbProducts.filter(p => p.categoryId === cat.slug || p.category_slugs?.includes(cat.slug));
      const previewImages = categoryProducts
        .map(p => p.image)
        .filter((img, i, self) => img && self.indexOf(img) === i)
        .slice(0, 4);

      let name = cat.name;
      if (cat.slug === 'rallongesmultiprises') name = 'Équipements électriques';
      if (cat.slug === 'bloc-dalimentation-batteries') name = "Blocs d'alimentation & batteries";
      if (cat.slug === 'poids-support') name = "Poids & Supports";

      return {
        ...cat,
        name,
        productCount: categoryProducts.length,
        previewImages,
        products: categoryProducts.slice(0, 100)
      };
    })
    .filter(cat => (cat as any).productCount > 0)
    .sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.slug);
      const indexB = preferredOrder.indexOf(b.slug);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    
    return results;
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
          const isInCategory = (itemFolderId && targetFolderIds.includes(String(itemFolderId))) || 
                               (mappedCategories && (mappedCategories.includes(cat.name) || mappedCategories.includes(cat.name.replace('&', '&amp;'))));
          if (!isInCategory) return false;
          const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
          return !itemTags.some((tag: string) => rules.hideTags.includes(tag));
        })
        .map(item => mapRentmanToProduct(item, cat.slug, filesLookup));

      const previewImages = categoryProducts
        .map(p => p.image)
        .filter((img, i, self) => img && self.indexOf(img) === i)
        .slice(0, 4);

      let name = cat.name;
      if (cat.slug === 'rallongesmultiprises') name = 'Équipements électriques';
      if (cat.slug === 'bloc-dalimentation-batteries') name = "Blocs d'alimentation & batteries";
      if (cat.slug === 'poids-support') name = "Poids & Supports";

      return {
        ...cat,
        name,
        productCount: categoryProducts.length,
        previewImages,
        products: categoryProducts.slice(0, 10)
      };
    })
    .filter(cat => (cat as any).productCount > 0)
    .sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.slug);
      const indexB = preferredOrder.indexOf(b.slug);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return results;
}

export interface FilesLookup {
  fileIdToUrl: Record<string, string>;
  itemIdToUrl: Record<string, string>;
  itemIdToUrls: Record<string, string[]>;
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
    const itemIdToUrls: Record<string, string[]> = {};
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
        // Only include files that are marked for the webshop
        if (file.url && file.in_webshop) {
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
            if (itemId) {
              if (!itemIdToUrls[itemId]) itemIdToUrls[itemId] = [];
              if (!itemIdToUrls[itemId].includes(file.url)) {
                itemIdToUrls[itemId].push(file.url);
              }
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
    
    console.log(`[Rentman] Built files lookup with ${Object.keys(fileIdToUrl).length} images and ${Object.keys(itemIdToUrls).length} items with multiple images`);
    return { fileIdToUrl, itemIdToUrl, itemIdToUrls };
  } catch (error) {
    console.error('Failed to fetch Rentman files:', error);
    throw error; // Stop the sync if we can't get files
  }
}

/**
 * Maps a Rentman item to our local Product schema
 */
export function mapRentmanToProduct(item: any, categoryId: string, filesLookup: FilesLookup = { fileIdToUrl: {}, itemIdToUrl: {}, itemIdToUrls: {} }): Product {
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

  // Strategy 3: Collect all images
  let images: string[] = [];
  if (item.id && filesLookup.itemIdToUrls[String(item.id)]) {
    images = [...filesLookup.itemIdToUrls[String(item.id)]];
  }
  
  // Ensure primary image is first in the list if it's not already there
  if (imageUrl && !images.includes(imageUrl)) {
    images.unshift(imageUrl);
  } else if (imageUrl && images.includes(imageUrl)) {
    // Move primary image to front
    images = [imageUrl, ...images.filter(img => img !== imageUrl)];
  }

  return {
    id: String(item.id),
    name: item.name,
    slug: item.id.toString(),
    categoryId,
    price: item.price || 0,
    description: item.shop_description_long || item.shop_description_short || item.description || '',
    image: imageUrl || '',
    images: images,
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
      
      // Hide if any hideTag is present
      if (itemTags.some((tag: string) => rules.hideTags.includes(tag))) return false;
      
      // If requiredTags are specified, at least one must be present
      if (rules.requiredTags && rules.requiredTags.length > 0) {
        return itemTags.some((tag: string) => rules.requiredTags?.includes(tag));
      }
      
      return true;
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
      images: p.image_urls || [p.image_url].filter(Boolean),
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

/**
 * Create a new Project Request in Rentman.
 * Accepts all writable fields from the Rentman ProjectRequest schema.
 */
export async function createProjectRequest(data: {
  name: string;
  usageperiod_start: string;
  usageperiod_end: string;
  planperiod_start: string;
  planperiod_end: string;
  contact_person_email: string;
  contact_person_first_name?: string;
  contact_person_lastname?: string;
  contact_person_middle_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_mailing_street?: string;
  contact_mailing_number?: string;
  contact_mailing_city?: string;
  contact_mailing_postalcode?: string;
  contact_mailing_country?: string;
  linked_contact?: string | null;
  linked_contact_person?: string | null;
  location_name?: string;
  location_mailing_street?: string;
  location_mailing_number?: string;
  location_mailing_city?: string;
  location_mailing_postalcode?: string;
  location_mailing_country?: string;
  location_phone?: string;
  price?: number;
  remark?: string;
  language?: string;
  external_reference?: number;
  is_paid?: boolean;
  in?: string | null;
  out?: string | null;
  [key: string]: any; // Allow additional fields
}) {
  return await rentmanFetch<any>('/projectrequests', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Fetch a single Project Request by ID to check its status
 */
export async function getProjectRequestById(id: string | number) {
  return await rentmanFetch<any>(`/projectrequests/${id}`);
}

/**
 * Fetch a single Project by ID to check its status
 */
export async function getProjectById(id: string | number) {
  return await rentmanFetch<any>(`/projects/${id}`);
}

/**
 * Add equipment to a Project Request.
 * Sets both `quantity` and `quantity_total` so that quantities
 * carry through when converting the request to a project in Rentman.
 */
export async function addEquipmentToProjectRequest(requestId: string | number, items: {
  name: string;
  quantity: number;
  equipmentId?: string | number;
  price?: number;
  order?: number;
}[]) {
  const results = [];
  for (const item of items) {
    try {
      const payload: any = {
        name: item.name,
        quantity: item.quantity,
        quantity_total: item.quantity,  // Must match quantity for proper conversion
        unit_price: item.price || 0,
        factor: '1',
        discount: 0,
        order: String(item.order ?? 0),
        is_comment: false,
        is_kit: false,
      };

      if (item.equipmentId) {
        payload.linked_equipment = `/equipment/${item.equipmentId}`;
      }

      // IMPORTANT: Use the NESTED endpoint under the specific project request.
      // The flat POST /projectrequestequipment does NOT exist in the Rentman API.
      const res = await rentmanFetch<any>(`/projectrequests/${requestId}/projectrequestequipment`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      results.push(res);
    } catch (error) {
      console.error(`Failed to add equipment ${item.name} to project request ${requestId}:`, error);
    }
  }
  return results;
}

/**
 * Search for a contact by email
 */
export async function getContactByEmail(email: string): Promise<any | null> {
  try {
    const results = await rentmanFetch<any[]>('/contacts', {
      params: { email_1: email, limit: 1 }
    });
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error searching contact by email ${email}:`, error);
    return null;
  }
}

/**
 * Search for a contact by name
 */
export async function getContactByName(name: string): Promise<any | null> {
  try {
    const results = await rentmanFetch<any[]>('/contacts', {
      params: { name: name, limit: 1 }
    });
    return results && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error searching contact by name ${name}:`, error);
    return null;
  }
}

/**
 * Create a new Contact (Company or Private)
 */
export async function createContact(data: {
  name: string;
  type: 'company' | 'private';
  email_1?: string;
  phone_1?: string;
  mailing_street?: string;
  mailing_city?: string;
  mailing_postalcode?: string;
  mailing_country?: string;
  [key: string]: any;
}): Promise<any> {
  return await rentmanFetch<any>('/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Create a new Contact Person for a Company
 */
export async function createContactPerson(contactId: string | number, data: {
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}): Promise<any> {
  return await rentmanFetch<any>(`/contacts/${contactId}/contactpersons`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get or Create a Contact and Person, then return the IDs to be linked
 */
export async function getOrCreateContactAndPerson(params: {
  companyName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}) {
  let contactId: string | number | null = null;
  let personId: string | number | null = null;

  try {
    // 1. Search for existing contact by email
    const existingContact = await getContactByEmail(params.email);
    
    if (existingContact) {
      contactId = existingContact.id;
      // If the contact found is a company, try to find/create the person
      if (existingContact.type === 'company') {
        const persons = await rentmanFetch<any[]>(`/contacts/${contactId}/contactpersons`);
        const existingPerson = persons.find(p => p.email === params.email);
        if (existingPerson) {
          personId = existingPerson.id;
        } else {
          const newPerson = await createContactPerson(contactId, {
            firstname: params.firstName,
            lastname: params.lastName,
            email: params.email,
            phone: params.phone
          });
          personId = newPerson.id;
        }
      }
    } else {
      // 2. Create new contact
      if (params.companyName) {
        // Create Company
        const newCompany = await createContact({
          name: params.companyName,
          type: 'company',
          email_1: params.email,
          phone_1: params.phone,
          mailing_street: params.address,
          mailing_city: params.city,
          mailing_postalcode: params.postalCode
        });
        contactId = newCompany.id;

        // Create Person linked to Company
        const newPerson = await createContactPerson(contactId!, {
          firstname: params.firstName,
          lastname: params.lastName,
          email: params.email,
          phone: params.phone
        });
        personId = newPerson.id;
      } else {
        // Create Private person as a Contact
        const newPrivate = await createContact({
          name: `${params.firstName} ${params.lastName}`,
          type: 'private',
          email_1: params.email,
          phone_1: params.phone,
          mailing_street: params.address,
          mailing_city: params.city,
          mailing_postalcode: params.postalCode
        });
        contactId = newPrivate.id;
      }
    }
  } catch (error) {
    console.error('Error in getOrCreateContactAndPerson:', error);
  }

  return { contactId, personId };
}

/**
 * Get or Create a Location (stored as a Company contact)
 */
export async function getOrCreateLocation(name: string, address: {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}) {
  if (!name) return null;

  try {
    const existing = await getContactByName(name);
    if (existing) return existing.id;

    const newLoc = await createContact({
      name: name,
      type: 'company',
      mailing_street: address.street,
      mailing_city: address.city,
      mailing_postalcode: address.postalCode,
      mailing_country: address.country || 'Canada'
    });
    return newLoc.id;
  } catch (error) {
    console.error(`Error in getOrCreateLocation for ${name}:`, error);
    return null;
  }
}
