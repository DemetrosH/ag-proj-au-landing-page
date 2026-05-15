import * as dotenv from 'dotenv';
import { join } from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: join(process.cwd(), 'apps/location/.env.local') });

async function inspectRentmanFiles() {
  const token = process.env.RENTMAN_API_TOKEN;
  if (!token) {
    console.error('RENTMAN_API_TOKEN not found');
    return;
  }

  const url = 'https://api.rentman.net/files?limit=10';
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${await response.text()}`);
    return;
  }

  const result: any = await response.json();
  const files = result.data || result;

  console.log('--- Rentman Files Inspection ---');
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      console.log(`\nFile ${index + 1}:`);
      console.log(JSON.stringify(file, null, 2));
    });
  } else {
    console.log('No files found or unexpected response format');
    console.log(result);
  }
}

inspectRentmanFiles();
