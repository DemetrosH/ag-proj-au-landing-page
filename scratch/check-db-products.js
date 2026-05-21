const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: path.resolve(__dirname, '../apps/location/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('name, category_slug, category_slugs');
    
    if (error) throw error;
    
    console.log(`Total products: ${products.length}`);
    
    const catCounts = {};
    products.forEach(p => {
      const slugs = p.category_slugs || [p.category_slug].filter(Boolean);
      slugs.forEach(slug => {
        catCounts[slug] = (catCounts[slug] || 0) + 1;
      });
    });
    
    console.log('Product counts per category slug in DB:');
    console.log(JSON.stringify(catCounts, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
