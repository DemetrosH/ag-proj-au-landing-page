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
export async function rentmanFetch<T>(endpoint: string, options: any = {}): Promise<T> {
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
        features: p.tags || [],
        isFeatured: p.is_featured
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
        products: categoryProducts.slice(0, 10)
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

/**
 * Fetches all files and returns a lookup map of file ID -> public URL
 * Uses pagination to ensure all files are retrieved.
 */
export async function getFilesLookup(): Promise<Record<string, string>> {
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
      features: p.tags || [],
      isFeatured: p.is_featured
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
