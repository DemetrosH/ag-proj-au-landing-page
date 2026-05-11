import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-05-01',
  useCdn: false,
});

async function testUpload() {
  const imageUrl = 'https://artefacturbain.ca/wp-content/uploads/2023/04/IMG_1515.jpg';
  console.log(`Uploading test image: ${imageUrl}`);
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  
  try {
    const asset = await client.assets.upload('image', buffer, {
      filename: 'test.jpg',
    });
    console.log('Upload successful:', asset._id);
  } catch (err: any) {
    console.error('Upload failed:', err.message);
  }

  try {
    console.log('Testing document creation...');
    const res = await client.create({
      _type: 'teamMember',
      name: 'Test Permission User',
      slug: { _type: 'slug', current: 'test-permission-user' },
    });
    console.log('Document creation successful:', res._id);
    // Cleanup
    await client.delete(res._id);
    console.log('Document deletion successful');
  } catch (err: any) {
    console.error('Document creation failed:', err.message);
  }
}

testUpload();
