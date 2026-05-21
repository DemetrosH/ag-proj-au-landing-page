const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@sanity/client');

dotenv.config({ path: path.resolve(__dirname, '../apps/location/.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gzkag8mw',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function run() {
  try {
    const docs = await client.fetch('*[_type == "categoryConfig"] { _id, rentmanId, title, order, orderedProducts }');
    console.log('Category Configs in Sanity:');
    // Filter and show configs that have orderedProducts populated
    console.log(JSON.stringify(docs.map(d => ({
      _id: d._id,
      title: d.title,
      rentmanId: d.rentmanId,
      orderedProductsCount: d.orderedProducts?.length || 0,
      orderedProductsSample: d.orderedProducts?.slice(0, 3)
    })), null, 2));
  } catch (err) {
    console.error('Error fetching from Sanity:', err);
  }
}

run();
