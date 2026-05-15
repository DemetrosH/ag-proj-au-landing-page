import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../apps/location/.env.local') });

// Manually implement rentmanFetch to avoid complex imports
async function rentmanFetch(endpoint: string) {
  const token = process.env.RENTMAN_API_TOKEN;
  const url = `https://api.rentman.net${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

async function run() {
  try {
    console.log('--- Project Statuses ---');
    const statuses = await rentmanFetch('/projectstatuses');
    console.log(JSON.stringify(statuses, null, 2));

    console.log('\n--- Project 171 Details (looking for status) ---');
    const project = await rentmanFetch('/projects/171');
    console.log(JSON.stringify(project.data || project, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
