/**
 * scrape-equipe-images.mjs
 * Scrapes the equipe page HTML to extract Elementor background image URLs,
 * matches them to team member names, downloads and uploads to Sanity CDN.
 */
import https from 'https';
import { createClient } from '@sanity/client';

const SANITY_TOKEN = 'skTKUKIdo7Z0VVsRLjGOBG3fxYfMfmfiHfx5xAto1aryTGlUwPSMQMuSh0x6Qz6QzCNDcll6E5tCKYYHYIpibH8LIVhJaPJov6GADS3ETR5908emVDxfWcDqLUXEoekfIZAo6jLcEnqGS02u84oJZzN4vSrh2LcRyuxNRFzrmJx7prCYcGyi';

const sanity = createClient({
  projectId: 'gzkag8mw',
  dataset: 'production',
  apiVersion: '2024-05-01',
  token: SANITY_TOKEN,
  useCdn: false,
});

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🌐 Fetching https://artefacturbain.ca/equipe/ ...\n');
  const html = await fetchHtml('https://artefacturbain.ca/equipe/');
  
  // Extract all data-dce-background-image-url values
  const bgUrlRegex = /data-dce-background-image-url="([^"]+)"/g;
  const allBgUrls = [];
  let m;
  while ((m = bgUrlRegex.exec(html)) !== null) {
    allBgUrls.push(m[1]);
  }
  console.log(`Found ${allBgUrls.length} background image URLs total`);

  // Filter to only portrait-like images (exclude icons, banners, etc.)
  const portraitUrls = allBgUrls.filter(url => {
    const lower = url.toLowerCase();
    // Skip thumbnails, logos, banners 
    if (lower.includes('logo') || lower.includes('icon') || lower.includes('banner')) return false;
    // Only keep jpg/jpeg/png
    return lower.match(/\.(jpg|jpeg|png)$/);
  });
  console.log(`Portrait-like URLs: ${portraitUrls.length}\n`);
  portraitUrls.forEach((url, i) => console.log(`  [${i}] ${url}`));

  // Extract name+image pairs - look for patterns where name appears near background image
  // The HTML structure is: container with background img, then inside it the person's name
  const memberRegex = /data-dce-background-image-url="([^"]+)"[^]*?class="[^"]*staff[^"]*"[^]*?<\/div>[^]*?<[^>]+>([^<]{3,50})<\/[^>]+>/g;

  // Alternative: extract name from elementor heading near each background image
  // Parse sections: find each staff card block
  const cardBlocks = html.split('container-staff');
  console.log(`\nFound ${cardBlocks.length - 1} staff card blocks\n`);

  const extracted = [];
  for (let i = 1; i < cardBlocks.length; i++) {
    const block = 'container-staff' + cardBlocks[i];
    
    // Get background image URL from THIS block or the preceding fragment
    const prevBlock = cardBlocks[i-1];
    const bgMatch = prevBlock.match(/data-dce-background-image-url="([^"]+)"[^]*$/);
    const imageUrl = bgMatch ? bgMatch[1] : null;

    // Get person name - look for heading text
    const nameMatch = block.match(/<h[1-6][^>]*>\s*([A-ZÀ-Ö][a-zA-ZÀ-ÿ\s\-']{2,40})\s*<\/h[1-6]>/);
    const name = nameMatch ? nameMatch[1].trim() : null;

    // Get role
    const roleMatch = block.match(/<p[^>]*>\s*([^<]{5,80})\s*<\/p>/);
    const role = roleMatch ? roleMatch[1].trim() : null;

    if (imageUrl && name) {
      extracted.push({ name, role, imageUrl });
      console.log(`✓ ${name} → ${imageUrl.split('/').pop()}`);
    }
  }

  if (extracted.length === 0) {
    console.log('\n⚠️  Could not pair names with images automatically. Raw URLs found:');
    portraitUrls.forEach(u => console.log(' ', u));
    return;
  }

  // Now get Sanity members that still need images
  console.log('\n\n🔍 Checking Sanity for members without images...');
  const sanityMembers = await sanity.fetch(
    `*[_type == "teamMember"] { _id, name, "hasSanityImage": defined(image.asset._ref) }`
  );

  let success = 0, noMatch = 0;

  for (const scraped of extracted) {
    // Find matching Sanity document by name (fuzzy)
    const sanityMember = sanityMembers.find(sm => {
      if (sm.hasSanityImage) return false;
      const a = sm.name.toLowerCase().replace(/[^a-z]/g, '');
      const b = scraped.name.toLowerCase().replace(/[^a-z]/g, '');
      return a === b || a.includes(b) || b.includes(a);
    });

    if (!sanityMember) {
      console.log(`⚠️  No Sanity match for "${scraped.name}" (already has image or not found)`);
      noMatch++;
      continue;
    }

    console.log(`\n👤 ${sanityMember.name}`);
    console.log(`   URL: ${scraped.imageUrl}`);

    try {
      process.stdout.write('   ⬇️  Downloading... ');
      const buf = await fetchBuffer(scraped.imageUrl);
      console.log(`${buf.length} bytes`);

      process.stdout.write('   ⬆️  Uploading to Sanity... ');
      const filename = scraped.imageUrl.split('/').pop();
      const asset = await sanity.assets.upload('image', buf, {
        contentType: 'image/jpeg',
        filename,
      });
      console.log(`✓ ${asset._id}`);

      await sanity.patch(sanityMember._id).set({
        image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }).commit();
      console.log(`   ✅ Patched`);
      success++;
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ Migrated: ${success}`);
  console.log(`⚠️  No match: ${noMatch}`);
  console.log('─'.repeat(50));
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
