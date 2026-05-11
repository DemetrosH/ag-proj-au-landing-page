import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WP_API_URL = 'https://artefacturbain.ca/wp-json/wp/v2/staff_member?per_page=100&_embed';

const categoryMap: Record<string, string> = {
  'administration_staff': 'administration',
  'archeologie_staff': 'archeologie',
  'accompagnement_culturel_staff': 'accompagnement',
  'evenementiel_staff': 'evenementiel',
  'numerique_staff': 'numerique',
};

async function generateJson() {
  console.log('Fetching staff from WordPress...');
  const response = await fetch(WP_API_URL);
  const wpStaff = await response.json();

  const documents = wpStaff.map((member: any) => {
    const name = member.title.rendered.replace(/&nbsp;/g, ' ').trim();
    const slug = member.slug;
    const bio = member.content.rendered.replace(/<[^>]*>?/gm, '').trim();
    
    const wpCategories = member._embedded?.['wp:term']?.[0] || [];
    const wpCategorySlug = wpCategories[0]?.slug;
    const department = categoryMap[wpCategorySlug] || 'administration';

    const featuredMedia = member._embedded?.['wp:featuredmedia']?.[0];
    const imageUrl = featuredMedia?.source_url;

    return {
      type: 'teamMember',
      content: {
        name,
        slug: { _type: 'slug', current: slug },
        bio,
        department,
        role: featuredMedia?.caption?.rendered.replace(/<[^>]*>?/gm, '').trim() || '',
        externalImageUrl: imageUrl,
      }
    };
  });

  const outputPath = path.resolve(__dirname, 'staff-documents.json');
  fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2), 'utf-8');
  console.log(`Successfully wrote ${documents.length} documents to ${outputPath}`);
}

generateJson().catch(console.error);
