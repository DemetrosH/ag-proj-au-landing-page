import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../apps/location/.env.local') });

const RENTMAN_API_URL = 'https://api.rentman.net';
const RENTMAN_TOKEN = process.env.RENTMAN_API_TOKEN;

async function debugRentmanID(id) {
  console.log(`Fetching Rentman Project Request ${id} directly...`);
  
  try {
    const res = await fetch(`${RENTMAN_API_URL}/projectrequests/${id}`, {
      headers: {
        'Authorization': `Bearer ${RENTMAN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
        const text = await res.text();
        console.error('Rentman Error:', text);
        return;
    }
    
    const data = await res.json();
    console.log(`Rentman Data ID ${id} Status:`, data.data.status);
  } catch (err) {
    console.error('Error:', err);
  }
}

async function run() {
    await debugRentmanID(31);
    await debugRentmanID(32);
}

run();
