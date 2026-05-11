
import dotenv from 'dotenv';
import path from 'path';

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
  return result; // Return full result to check pagination/meta if exists
}

async function countFiles() {
  console.log("Fetching files with limit 1...");
  const result = await rentmanFetch('/files', { params: { limit: 1 } });
  console.log("Result keys:", Object.keys(result));
  if (result.itemCount !== undefined) {
      console.log(`Total files (itemCount): ${result.itemCount}`);
  } else {
      console.log("No itemCount found. Fetching more to estimate...");
      const more = await rentmanFetch('/files', { params: { limit: 1000, offset: 1000 } });
      console.log(`Found ${more.data.length} files at offset 1000.`);
  }
}

countFiles().catch(console.error);
