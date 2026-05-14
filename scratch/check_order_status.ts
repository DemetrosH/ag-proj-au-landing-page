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

async function checkOrder() {
  const orderIdPrefix = '4652F87A';
  console.log(`Checking order starting with ${orderIdPrefix}...`);
  
  const { data, error } = await supabase
    .from('soumissions')
    .select('*');

  if (error) {
    console.error('Error fetching soumissions:', error);
    return;
  }

  const order = data.find(o => o.id.toLowerCase().startsWith(orderIdPrefix.toLowerCase()));
  
  if (order) {
    console.log('Order found:');
    console.log(JSON.stringify(order, null, 2));
  } else {
    console.log('Order not found in the list of', data.length, 'orders.');
    if (data.length > 0) {
        console.log('Recent orders:');
        data.slice(0, 3).forEach(o => console.log(`- ${o.id}: status=${o.status}, rentman_id=${o.rentman_id}`));
    }
  }
}

checkOrder();
