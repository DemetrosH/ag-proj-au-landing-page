import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-05-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const teamMembersData = [
  {
    "name": "Jeanne Couture",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/BE1A4704_Nik_DxO-scaled.jpg"
  },
  {
    "name": "Irène St-Amand",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2026/02/20260202_073525-scaled.jpg"
  },
  {
    "name": "Émile Couture",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/BE1A4681_Nik_DxO-scaled.jpg"
  },
  {
    "name": "Félicia Corbeil",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/09/GEOPARC_CHARLEVOIX_PALISSADES_ETE_202255-scaled-e1758042284241.jpg"
  },
  {
    "name": "Marie-Anne Paradis",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2024/06/Marie-Anne-Paradis.jpg"
  },
  {
    "name": "Joey Leblanc",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/BE1A4761_Nik_DxO-scaled.jpg"
  },
  {
    "name": "Simon Paquin",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/Simon-Paquin.jpg"
  },
  {
    "name": "Véronique Marengère",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/06/20250424_151227-scaled.jpg"
  },
  {
    "name": "Eli Blouin Rondeau",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/06/20250424_151250-scaled.jpg"
  },
  {
    "name": "Odile Pelletier",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/04/IMG_1515.jpg"
  },
  {
    "name": "Vanadis Moussu",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/woocommerce-placeholder-2.png"
  },
  {
    "name": "Éloïse Plamondon-Pagé",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/woocommerce-placeholder-1-e1712259528603.png"
  },
  {
    "name": "Laurie Juteau",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/woocommerce-placeholder-2.png"
  },
  {
    "name": "Christian Couture",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/woocommerce-placeholder-1-e1712259528603.png"
  },
  {
    "name": "Fanny Mignet",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/01/20250112_134355-scaled.jpg"
  },
  {
    "name": "Damien Checoury",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/01/IMG_2660-1-1-scaled.jpg"
  },
  {
    "name": "Olivier Arseneault",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2025/09/att.zO6xGuLzeqvw10WOotGfNgkQmf9tKRPMeB0AyrQT-Us.jpeg"
  },
  {
    "name": "Elysanne Tremblay",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/woocommerce-placeholder-2.png"
  },
  {
    "name": "Vincent Arsenault",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/BE1A4693_Nik_DxO-scaled.jpg"
  },
  {
    "name": "Mitja Lešnik",
    "imageUrl": "https://artefacturbain.ca/wp-content/uploads/2023/03/BE1A4790_Nik_DxO-scaled.jpg"
  }
];

async function syncImages() {
  console.log('Starting staff image synchronization...');

  for (const member of teamMembersData) {
    try {
      console.log(`Processing ${member.name}...`);

      // 1. Find the document in Sanity
      const sanityMember = await client.fetch(
        `*[_type == "teamMember" && name == $name][0]`,
        { name: member.name }
      );

      if (!sanityMember) {
        console.warn(`Could not find team member "${member.name}" in Sanity. Skipping.`);
        continue;
      }

      // 2. Download the image
      const response = await fetch(member.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${member.imageUrl}: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();

      // 3. Upload to Sanity
      const asset = await client.assets.upload('image', Buffer.from(buffer), {
        filename: `${member.name.replace(/\s+/g, '-').toLowerCase()}.jpg`,
      });

      // 4. Update the document
      await client
        .patch(sanityMember._id)
        .set({
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
        })
        .unset(['externalImageUrl'])
        .commit();

      console.log(`Successfully updated ${member.name}`);
    } catch (error) {
      console.error(`Error processing ${member.name}:`, error.message);
    }
  }

  console.log('Synchronization complete.');
}

syncImages();
