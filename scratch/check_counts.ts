import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import wcData from '../apps/location/data/wc-data.json';

dotenv.config({ path: 'apps/location/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function checkCategoryCounts() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: products, error } = await supabase.from('products').select('category_slug, category_slugs');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Category Counts:');
  for (const cat of wcData.categories) {
    const count = products?.filter(p => p.category_slug === cat.slug || p.category_slugs?.includes(cat.slug)).length || 0;
    console.log(`${cat.name} (${cat.slug}): ${count}`);
  }
}

checkCategoryCounts();
