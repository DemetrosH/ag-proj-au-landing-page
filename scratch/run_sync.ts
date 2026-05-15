import { syncRentmanToSupabase } from '../apps/location/lib/sync';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'apps/location/.env.local' });

async function runSync() {
  console.log('Starting sync...');
  const result = await syncRentmanToSupabase();
  console.log('Sync Result:', JSON.stringify(result, null, 2));
}

runSync();
