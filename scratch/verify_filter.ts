import * as dotenv from 'dotenv';
import { join } from 'path';
import { getFilesLookup } from '../apps/location/lib/rentman.js'; // Assuming we can run the compiled version or use ts-node

dotenv.config({ path: join(process.cwd(), 'apps/location/.env.local') });

async function verifyFilter() {
  console.log('Fetching files lookup with filter applied...');
  try {
    const filesLookup = await getFilesLookup();
    const fileIds = Object.keys(filesLookup.fileIdToUrl);
    const itemIds = Object.keys(filesLookup.itemIdToUrls);
    
    console.log(`Total files in lookup: ${fileIds.length}`);
    console.log(`Total items with images: ${itemIds.length}`);
    
    // To fully verify, we'd need to compare with a non-filtered run, 
    // but we can at least see that it's working and the count is reasonable.
    // In my previous inspection, I saw files with in_webshop: false.
    // If those are gone, the count should be lower.
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

verifyFilter();
