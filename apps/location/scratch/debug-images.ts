
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

async function debugImages() {
  console.log("Fetching equipment...");
  const equipment = await rentmanFetch('/equipment', { params: { limit: 10 } });
  
  console.log(`Found ${equipment.length} items.`);
  
  for (const item of equipment) {
    console.log(`\nItem: ${item.name} (ID: ${item.id})`);
    console.log(`- image field: ${item.image}`);
    
    // Check if there are other image related fields
    const imageFields = Object.keys(item).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('file'));
    console.log(`- other image/file fields:`, imageFields.map(f => `${f}: ${item[f]}`));

    if (item.image) {
        const fileId = item.image.split('/').pop();
        console.log(`- Attempting to fetch file ${fileId}...`);
        try {
            const file = await rentmanFetch(`/files/${fileId}`);
            console.log(`  - File URL found: ${file.url ? 'YES' : 'NO'}`);
            if (file.url) console.log(`  - URL: ${file.url.substring(0, 50)}...`);
        } catch (e) {
            console.log(`  - Failed to fetch file ${fileId}`);
        }
    }
  }

  console.log("\nFetching files sample...");
  const files = await rentmanFetch('/files', { params: { limit: 5 } });
  console.log("Files sample:", JSON.stringify(files, null, 2));
}

debugImages().catch(console.error);
