/**
 * migrate-images.mjs
 * Downloads team member portrait images from WordPress and uploads them to Sanity CDN.
 * Then patches each teamMember document with the new Sanity image asset reference.
 */

import https from 'https';
import http from 'http';
import { createClient } from '@sanity/client';

const PROJECT_ID = 'gzkag8mw';
const DATASET = 'production';
const API_TOKEN = 'skTKUKIdo7Z0VVsRLjGOBG3fxYfMfmfiHfx5xAto1aryTGlUwPSMQMuSh0x6Qz6QzCNDcll6E5tCKYYHYIpibH8LIVhJaPJov6GADS3ETR5908emVDxfWcDqLUXEoekfIZAo6jLcEnqGS02u84oJZzN4vSrh2LcRyuxNRFzrmJx7prCYcGyi';
const API_VERSION = '2024-05-01';

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: API_TOKEN,
  useCdn: false,
});

// Fetch a URL as a Buffer, following redirects
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers['content-type'] || 'image/jpeg' }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🔍 Fetching team members from Sanity...\n');

  const members = await client.fetch(
    `*[_type == "teamMember" && defined(externalImageUrl)] { _id, name, externalImageUrl }`
  );

  console.log(`Found ${members.length} members with external image URLs.\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const member of members) {
    const { _id, name, externalImageUrl } = member;

    // Skip placeholder images
    if (externalImageUrl.includes('woocommerce-placeholder') || externalImageUrl.includes('placeholder')) {
      console.log(`⏭  Skipping placeholder for ${name}`);
      skipCount++;
      continue;
    }

    try {
      process.stdout.write(`⬇️  Downloading image for ${name}... `);
      const { buffer, contentType } = await fetchBuffer(externalImageUrl);
      console.log(`${buffer.length} bytes`);

      process.stdout.write(`   ⬆️  Uploading to Sanity CDN... `);
      const asset = await client.assets.upload('image', buffer, {
        contentType,
        filename: externalImageUrl.split('/').pop(),
      });
      console.log(`✓ asset: ${asset._id}`);

      // Patch the document with the new Sanity image asset
      await client
        .patch(_id)
        .set({
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
        })
        .commit();

      console.log(`   ✅ Patched ${name}\n`);
      successCount++;

      // Small delay to be polite to both servers
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.log(`\n   ❌ Error for ${name}: ${err.message}\n`);
      errorCount++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭  Skipped (placeholder): ${skipCount}`);
  console.log(`❌ Errors:  ${errorCount}`);
  console.log('─'.repeat(50));
  console.log('\nDone! Images are now hosted on Sanity CDN.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
