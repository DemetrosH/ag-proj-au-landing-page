import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../apps/location/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatest() {
  console.log('Checking LATEST 5 orders...');
  
  const { data, error } = await supabase
    .from('soumissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching soumissions:', error);
    return;
  }

  data.forEach((o, i) => {
    console.log(`\n--- Order ${i+1}: ${o.id} ---`);
    console.log(`Created: ${o.created_at}`);
    console.log(`Status: ${o.status}`);
    console.log(`Rentman ID: ${o.rentman_id}`);
    
    // Check if it's in metadata fallback
    if (o.event_details?.includes('--- METADATA ---')) {
      const metaPart = o.event_details.split('--- METADATA ---')[1].trim();
      console.log(`Metadata Found: ${metaPart}`);
    } else {
      console.log('No metadata block found.');
    }
  });
}

checkLatest();
