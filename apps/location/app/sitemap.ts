import { MetadataRoute } from 'next';
import { getCategories } from '../lib/rentman';
import { createClient } from '../lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://artefacturbain.ca/location';

  // 1. Static URLs
  const staticPaths = [
    '',
    '/contact',
    '/devenir-partenaire',
    '/conditions',
    '/confidentialite',
    '/cookies',
    '/login',
    '/signup'
  ];

  const staticUrls = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Categories
  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryUrls = categories
      .filter(cat => !cat.no_index) // respect SEO no_index setting
      .map((cat) => ({
        url: `${baseUrl}/categories/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error('[Sitemap] Failed to fetch categories:', error);
  }

  // 3. Dynamic Products
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('rentman_id, slug, updated_at, no_index');

    if (products && !error) {
      productUrls = products
        .filter(prod => !prod.no_index) // respect SEO no_index setting
        .map((prod) => ({
          url: `${baseUrl}/products/${prod.slug}`,
          lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch products:', error);
  }

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
