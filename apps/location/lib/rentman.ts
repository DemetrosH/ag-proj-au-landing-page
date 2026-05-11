/**
 * Rentman API Utility & Product Mapping
 */

const RENTMAN_BASE_URL = 'https://api.rentman.net';
const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

// Import WooCommerce mapping data
import wcData from '../data/wc-data.json';
import { UserRole, URBA_ACCESS_RULES } from './access-control';

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
async function rentmanFetch<T>(endpoint: string, options: any = {}): Promise<T> {
  if (!RENTMAN_API_TOKEN || RENTMAN_API_TOKEN === 'YOUR_RENTMAN_API_TOKEN') {
    throw new Error('Rentman API Token is not configured');
  }

  const url = new URL(`${RENTMAN_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
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
async function rentmanFetchAll<T>(endpoint: string, params: any = {}): Promise<T[]> {
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
 * Enhanced getCategories for Home Page with product previews
 */
export async function getHomeCategories(role: UserRole = 'guest'): Promise<Category[]> {
  const rules = URBA_ACCESS_RULES[role];
  const categories = await getCategories();
  
  // Filter out hidden categories
  const allowedCategories = categories.filter(cat => !rules.hideCats.includes(cat.slug));
  
  const [allEquipment, folders, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment'),
    rentmanFetchAll<any>('/folders'),
    getFilesLookup()
  ]);

  const results = allowedCategories.map(cat => {
    // Find matching folder IDs for this category
    const targetFolderIds = folders
      .filter(f => {
        const folderName = f.name.toLowerCase().trim();
        const catName = cat.name.toLowerCase().trim();
        return folderName === catName || 
               folderName === `${catName}-ws` || 
               folderName === `${catName} - ws` ||
               f.path.toLowerCase().includes(`/${catName}/`) ||
               f.path.toLowerCase().includes(`/${catName}-ws/`);
      })
      .map(f => String(f.id));

    // Get products for this category using the same logic as getProductsForCategory
    const categoryProducts = allEquipment
      .filter(item => {
        if (!item.in_shop) return false;
        
        const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
        if (itemFolderId && targetFolderIds.includes(String(itemFolderId))) return true;

        const itemNameLower = item.name.toLowerCase().trim();
        const mappedCategories = (wcData.productMapping as any)[itemNameLower];
        const isInCategory = mappedCategories && mappedCategories.includes(cat.name);
        
        if (!isInCategory) return false;

        // Check for hidden tags
        const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
        const hasHiddenTag = itemTags.some((tag: string) => rules.hideTags.includes(tag));
        
        return !hasHiddenTag;
      })
      .map(item => mapRentmanToProduct(item, cat.slug, filesLookup));

    // Extract first 4 unique images for the grid preview
    const previewImages: string[] = [];
    const seenImages = new Set<string>();

    for (const p of categoryProducts) {
      if (previewImages.length >= 4) break;
      if (p.image && !seenImages.has(p.image)) {
        previewImages.push(p.image);
        seenImages.add(p.image);
      }
    }

    return {
      ...cat,
      productCount: categoryProducts.length,
      previewImages,
      products: categoryProducts.slice(0, 10) // Include top 10 products for carousel
    };
  });

  const filteredResults = results.filter(cat => (cat as any).productCount > 0);
  console.log(`[Rentman] Found ${filteredResults.length} active categories for landing page`);
  return filteredResults;
}

/**
 * Fetches all files and returns a lookup map of file ID -> public URL
 * Uses pagination to ensure all files are retrieved.
 */
async function getFilesLookup(): Promise<Record<string, string>> {
  try {
    const lookup: Record<string, string> = {};
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
          lookup[String(file.id)] = file.url;
        }
      });

      if (files.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
      
      // Safety break to prevent infinite loops (e.g. if limit is very high or API behaves weirdly)
      if (offset > 20000) break; 
    }
    
    console.log(`[Rentman] Built files lookup with ${Object.keys(lookup).length} images`);
    return lookup;
  } catch (error) {
    console.error('Failed to fetch Rentman files:', error);
    return {};
  }
}

/**
 * Maps a Rentman item to our local Product schema
 */
function mapRentmanToProduct(item: any, categoryId: string, filesLookup: Record<string, string> = {}): Product {
  // Extract file ID from "/files/123"
  const fileId = item.image ? item.image.split('/').pop() : null;
  const imageUrl = fileId ? filesLookup[fileId] : '';

  return {
    id: String(item.id),
    name: item.name,
    slug: item.id.toString(),
    categoryId,
    price: item.price || 0,
    description: item.shop_description_long || item.shop_description_short || item.description || '',
    image: imageUrl || '',
    features: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
    isFeatured: !!item.shop_featured,
  };
}

/**
 * Fetch general equipment (all categories)
 */
export async function getEquipment(limit = 100, role: UserRole = 'guest'): Promise<Product[]> {
  const rules = URBA_ACCESS_RULES[role];
  const [allEquipment, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment', { limit }),
    getFilesLookup()
  ]);
  
  const filtered = allEquipment
    .filter(item => {
      if (!item.in_shop) return false;
      
      // Check for hidden tags
      const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
      const hasHiddenTag = itemTags.some((tag: string) => rules.hideTags.includes(tag));
      if (hasHiddenTag) return false;

      return true;
    })
    .map(item => mapRentmanToProduct(item, 'general', filesLookup));

  return filtered;
}

/**
 * Fetch all equipment and filter by category slug
 */
export async function getProductsForCategory(categorySlug: string, role: UserRole = 'guest'): Promise<Product[]> {
  const rules = URBA_ACCESS_RULES[role];
  // Find the category corresponding to the slug
  const category = wcData.categories.find(c => c.slug === categorySlug);
  if (!category) return [];

  const categoryName = category.name;

  const [allEquipment, folders, filesLookup] = await Promise.all([
    rentmanFetchAll<any>('/equipment'),
    rentmanFetchAll<any>('/folders'),
    getFilesLookup()
  ]);
  
  // Find folders that match our criteria
  const targetFolderIds = folders
    .filter(f => {
      const folderName = f.name.toLowerCase().trim();
      const catName = categoryName.toLowerCase().trim();
      return folderName === catName || 
             folderName === `${catName}-ws` || 
             folderName === `${catName} - ws` ||
             f.path.toLowerCase().includes(`/${catName}/`) ||
             f.path.toLowerCase().includes(`/${catName}-ws/`);
    })
    .map(f => String(f.id));

  const filtered = allEquipment.filter(item => {
    if (!item.in_shop) return false;
    
    // 1. Check if product is in a new Rentman "-WS" folder
    const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
    const itemNameLower = item.name.toLowerCase().trim();
    const mappedCategories = (wcData.productMapping as any)[itemNameLower];

    let isInCategory = false;
    if (itemFolderId && targetFolderIds.includes(String(itemFolderId))) {
      isInCategory = true;
    } else if (mappedCategories && mappedCategories.includes(categoryName)) {
      isInCategory = true;
    }

    if (!isInCategory) return false;

    // 2. Check for hidden tags
    const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
    const hasHiddenTag = itemTags.some((tag: string) => rules.hideTags.includes(tag));
    
    return !hasHiddenTag;
  });

  return filtered.map(item => mapRentmanToProduct(item, categorySlug, filesLookup));
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string, role: UserRole = 'guest'): Promise<Product | null> {
  const rules = URBA_ACCESS_RULES[role];
  const item = await rentmanFetch<any>(`/equipment/${id}`);
  if (!item || !item.in_shop) return null;
  
  // Check for hidden tags
  const itemTags = item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [];
  const hasHiddenTag = itemTags.some((tag: string) => rules.hideTags.includes(tag));
  if (hasHiddenTag) return null;

  // Resolve image for the single product
  const fileId = item.image ? item.image.split('/').pop() : null;
  let imageUrl = '';
  if (fileId) {
    try {
      const file = await rentmanFetch<any>(`/files/${fileId}`);
      imageUrl = file?.url || '';
    } catch (e) {
      console.error(`Failed to resolve image for product ${id}:`, e);
    }
  }

  return {
    ...mapRentmanToProduct(item, 'unknown'),
    image: imageUrl || ''
  };
}
