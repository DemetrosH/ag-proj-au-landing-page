import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const WC_URL = process.env.WC_SITE_URL;

async function syncWooCommerce() {
  if (!WC_KEY || !WC_SECRET || !WC_URL) {
    console.error('Missing WooCommerce credentials in .env.local');
    return;
  }

  console.log('--- Syncing WooCommerce Categories ---');
  
  const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Fetch Categories
    const catRes = await fetch(`${WC_URL}/wp-json/wc/v3/products/categories?per_page=100`, { headers });
    const categories = await catRes.json();
    
    if (!Array.isArray(categories)) {
      console.error('Failed to fetch categories:', categories);
      return;
    }

    console.log(`Found ${categories.length} categories.`);

    // 2. Fetch Products (and their categories)
    let allProducts: any[] = [];
    let page = 1;
    let hasMore = true;

    console.log('Fetching products...');
    while (hasMore) {
      const prodRes = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100&page=${page}`, { headers });
      const products = await prodRes.json();
      
      if (!Array.isArray(products) || products.length === 0) {
        hasMore = false;
      } else {
        allProducts = [...allProducts, ...products];
        console.log(`Fetched ${allProducts.length} products...`);
        page++;
      }
    }

    // 3. Create Mapping
    const mapping: Record<string, string[]> = {};
    allProducts.forEach(p => {
      mapping[p.name.toLowerCase().trim()] = p.categories.map((c: any) => c.name);
    });

    // 4. Group by Category
    const categoryToProducts: Record<string, string[]> = {};
    allProducts.forEach(p => {
      p.categories.forEach((c: any) => {
        if (!categoryToProducts[c.name]) categoryToProducts[c.name] = [];
        categoryToProducts[c.name].push(p.name);
      });
    });

    console.log('\n--- Category Analysis ---');
    Object.keys(categoryToProducts).forEach(cat => {
      console.log(`${cat}: ${categoryToProducts[cat].length} products`);
    });

    // Output a clean JSON for use in the app
    const data = {
      categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, description: c.description })),
      productMapping: mapping
    };

    fs.writeFileSync('wc-data.json', JSON.stringify(data, null, 2));
    console.log('\n--- Sync Complete: Data saved to wc-data.json ---');

  } catch (error) {
    console.error('Sync error:', error);
  }
}

syncWooCommerce();
