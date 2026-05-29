import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gzkag8mw',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Set to false to avoid CDN caching issues for edited content
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published' as const, // Automatically filters out draft documents from results
};

export const client = createClient(config);

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getLocationDivision() {
  return await client.fetch(
    `*[_type == "division" && slug.current == "location"][0] {
      _id,
      title,
      "slug": slug.current,
      description,
      "imageUrl": image.asset->url,
      link,
      order
    }`,
    {},
    {
      cache: 'no-store',
      next: { revalidate: 0 }
    }
  );
}

import { getVisibilityFilters, UserRole } from './access-control';

export async function getCategoryConfigs(role: UserRole = 'guest') {
  const visibilityFilter = getVisibilityFilters(role, 'rentmanId');
  
  // Note: We apply the visibility filter to the featuredProducts slugs if possible,
  // but the primary focus is filtering the categories themselves.
  return await client.fetch(
    `*[_type == "categoryConfig" && ${visibilityFilter}] | order(order asc) {
      rentmanId,
      title,
      description,
      featuredProducts[] {
        name,
        slug,
        "imageUrl": image.asset->url
      },
      order,
      orderedProducts[] {
        name,
        slug
      }
    }`,
    {},
    {
      cache: 'no-store',
      next: { revalidate: 0 }
    }
  );
}

