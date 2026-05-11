import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from apps/base-app/.env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error('Missing Sanity credentials in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-05-01',
  useCdn: false,
});

const WP_API_URL = 'https://artefacturbain.ca/wp-json/wp/v2/staff_member?per_page=100&_embed';

const categoryMap: Record<string, string> = {
  'administration_staff': 'administration',
  'archeologie_staff': 'archeologie',
  'accompagnement_culturel_staff': 'accompagnement',
  'evenementiel_staff': 'evenementiel',
  'numerique_staff': 'numerique',
};

async function syncStaff() {
  console.log('Fetching staff from WordPress...');
  const response = await fetch(WP_API_URL);
  const wpStaff = await response.json();

  console.log(`Found ${wpStaff.length} staff members.`);

  for (const member of wpStaff) {
    const name = member.title.rendered.replace(/&nbsp;/g, ' ').trim();
    const slug = member.slug;
    const bio = member.content.rendered.replace(/<[^>]*>?/gm, '').trim(); // Basic HTML strip
    
    // Get category
    const wpCategories = member._embedded?.['wp:term']?.[0] || [];
    const wpCategorySlug = wpCategories[0]?.slug;
    const department = categoryMap[wpCategorySlug] || 'administration';

    // Get image URL
    const featuredMedia = member._embedded?.['wp:featuredmedia']?.[0];
    const imageUrl = featuredMedia?.source_url;

    console.log(`Processing ${name} (${department})...`);

    try {
      // 1. Upload image if available
      let imageAssetId = null;
      if (imageUrl) {
        console.log(`  Uploading image: ${imageUrl}`);
        const imageRes = await fetch(imageUrl);
        const imageBlob = await imageRes.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const asset = await client.assets.upload('image', buffer, {
          filename: `${slug}.jpg`,
        });
        imageAssetId = asset._id;
      }

      // 2. Check if member already exists in Sanity
      const existing = await client.fetch(`*[_type == "teamMember" && slug.current == $slug][0]`, { slug });

      const doc = {
        _type: 'teamMember',
        name,
        slug: { _type: 'slug', current: slug },
        bio,
        department,
        role: featuredMedia?.caption?.rendered.replace(/<[^>]*>?/gm, '').trim() || '', // Use caption as role if available, or empty
        externalImageUrl: imageUrl,
        ...(imageAssetId ? {
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAssetId,
            },
          },
        } : {}),
      };

      if (existing) {
        console.log(`  Updating existing document: ${existing._id}`);
        await client.patch(existing._id).set(doc).commit();
      } else {
        console.log(`  Creating new document`);
        await client.create(doc);
      }
    } catch (err) {
      console.error(`  Error processing ${name}:`, err);
    }
  }

  console.log('Sync complete!');
}

syncStaff().catch(console.error);
