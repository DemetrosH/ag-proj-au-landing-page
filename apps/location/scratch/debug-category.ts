
import dotenv from 'dotenv';
import path from 'path';

// Load env from apps/location/.env.local
dotenv.config({ path: path.resolve(process.cwd(), 'apps/location/.env.local') });

const RENTMAN_BASE_URL = 'https://api.rentman.net';
const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

async function rentmanFetch(endpoint: string, options: any = {}) {
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

  const result = await response.json();
  return result.data || result;
}

async function debugCategory(categoryName: string) {
  console.log(`\n--- Debugging Category: ${categoryName} ---`);
  
  const [allEquipment, folders] = await Promise.all([
    rentmanFetch<any[]>('/equipment', { params: { limit: 1000 } }),
    rentmanFetch<any[]>('/folders', { params: { limit: 1000 } })
  ]);

  const targetFolderIds = folders
    .filter(f => {
      const folderName = f.name.toLowerCase().trim();
      const catName = categoryName.toLowerCase().trim();
      return folderName === catName || 
             folderName === `${catName}-ws` || 
             f.path.toLowerCase().includes(`/${catName}/`);
    })
    .map(f => String(f.id));

  console.log(`Found target folder IDs: ${targetFolderIds.join(', ')}`);

  const categoryProducts = allEquipment.filter(item => {
    if (!item.in_shop) return false;
    const itemFolderId = item.folder ? item.folder.split('/').pop() : null;
    return itemFolderId && targetFolderIds.includes(String(itemFolderId));
  });

  console.log(`Found ${categoryProducts.length} products in this category.`);

  for (const item of categoryProducts) {
    console.log(`- Product: ${item.name} | Image: ${item.image}`);
  }
}

debugCategory('Alimentaire').catch(console.error);
debugCategory('Ameublement').catch(console.error);
