import { config } from 'dotenv';
config({ path: 'apps/location/.env.local' });
import { createClient } from '../apps/location/lib/supabase/client';

async function checkSchema() {
  const supabase = createClient();
  const { data, error } = await supabase.from('soumissions').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data found in soumissions table.');
  }
}

checkSchema();
