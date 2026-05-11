
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'apps/location/.env.local') });

async function test() {
    // Dynamically import after dotenv
    const { getHomeCategories } = await import('../lib/rentman');
    
    console.log("Fetching home categories...");
    const categories = await getHomeCategories();
    
    for (const cat of categories) {
        console.log(`\nCategory: ${cat.name}`);
        console.log(`- Product count: ${cat.productCount}`);
        console.log(`- Preview images found: ${cat.previewImages?.length}`);
        if (cat.previewImages?.length) {
            cat.previewImages.forEach((img, i) => console.log(`  [${i}] ${img.substring(0, 60)}...`));
        }
    }
}

test().catch(console.error);
