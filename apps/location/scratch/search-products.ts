import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables IMMEDIATELY before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Now we can import the libs that depend on process.env
const { getEquipment } = await import('../lib/rentman.js');

async function searchProducts() {
  console.log('Searching products...');
  try {
    const products = await getEquipment(1000); // Try to get a large number
    
    const keywords = ['popcorn', 'four'];
    
    const matches = products.filter(p => {
      const lowerName = p.name.toLowerCase();
      return keywords.some(kw => lowerName.includes(kw));
    });

    console.log(`Found ${matches.length} matches:`);
    matches.forEach(p => {
      console.log(`- ${p.name} (Slug: ${p.slug})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

searchProducts();
