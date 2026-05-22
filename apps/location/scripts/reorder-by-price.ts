import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables IMMEDIATELY
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const { getHomeCategories } = await import('../lib/rentman.js');
const { client } = await import('../lib/sanity.js');

async function run() {
  console.log('🚀 Starting sorting of Sanity products and card grid images from most expensive to cheapest...');
  
  if (!process.env.RENTMAN_API_TOKEN) {
    console.error('❌ ERROR: RENTMAN_API_TOKEN is missing!');
    process.exit(1);
  }

  try {
    const categories = await getHomeCategories('admin');
    console.log(`📦 Found ${categories.length} categories in Rentman.`);

    for (const category of categories) {
      console.log(`\nProcessing category: ${category.name} (${category.slug})...`);

      // Sort products by price descending
      const sortedProducts = [...(category.products || [])].sort((a: any, b: any) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        
        if (priceA === 0 && priceB > 0) return 1;
        if (priceB === 0 && priceA > 0) return -1;
        
        return priceB - priceA;
      });

      console.log(`  Sorted ${sortedProducts.length} products by price descending.`);

      // 1. Map to orderedProducts (catalog page list)
      const orderedProducts = sortedProducts.map((p: any, i: number) => ({
        _key: `prod_${p.slug}_${Date.now()}_${i}`,
        _type: 'orderedProduct',
        name: p.name,
        slug: p.slug
      }));

      // 2. Map to featuredProducts (2x2 grid images) - take the 4 most expensive with images
      const expensiveWithImages = sortedProducts.filter(p => p.image);
      const expensiveForGrid = [...expensiveWithImages];
      
      // Fallback if less than 4 have images
      if (expensiveForGrid.length < 4) {
        const withoutImages = sortedProducts.filter(p => !p.image);
        while (expensiveForGrid.length < 4 && withoutImages.length > 0) {
          const item = withoutImages.shift();
          if (item) {
            expensiveForGrid.push(item);
          }
        }
      }

      const featuredProducts = expensiveForGrid.slice(0, 4).map((p: any, i: number) => ({
        _key: `feat_${p.slug}_${Date.now()}_${i}`,
        name: p.name,
        slug: p.slug
      }));

      const docId = `category-config-${category.slug}`;
      const draftId = `drafts.${docId}`;

      // Check existence
      let docExists = false;
      try {
        const doc = await client.getDocument(docId);
        if (doc) docExists = true;
      } catch (err) {
        // Ignored
      }

      let draftExists = false;
      try {
        const draft = await client.getDocument(draftId);
        if (draft) draftExists = true;
      } catch (err) {
        // Ignored
      }

      if (docExists) {
        console.log(`  📝 Patching published config: ${docId}`);
        await client.patch(docId).set({ orderedProducts, featuredProducts }).commit();
      }

      if (draftExists) {
        console.log(`  📝 Patching draft config: ${draftId}`);
        await client.patch(draftId).set({ orderedProducts, featuredProducts }).commit();
      }

      if (!docExists && !draftExists) {
        console.log(`  ⚠️ No category config document found in Sanity for ${category.slug}. Skipping patch.`);
      }
    }

    console.log('\n✅ All category product lists and grid images successfully sorted by price descending in Sanity!');
  } catch (error) {
    console.error('❌ Sorting migration failed:', error);
  }
}

run();
