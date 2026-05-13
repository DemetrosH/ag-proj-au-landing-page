import { syncRentmanToSupabase } from '../lib/sync';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Running sync...');
  const result = await syncRentmanToSupabase();
  console.log('Result:', result);
}

main().catch(console.error);
