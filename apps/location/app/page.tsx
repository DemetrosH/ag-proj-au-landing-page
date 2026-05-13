import { Header } from '../components/Header';
import { LandingPage } from '../components/LandingPage';
import { getHomeCategories, getEquipment } from '../lib/rentman';
import { getLocationDivision, getCategoryConfigs } from '../lib/sanity';
import { Footer } from '../components/Footer';

import { getUserRole } from '../lib/auth';

// Cache the page for 1 hour — Rentman API data doesn't change frequently
export const revalidate = 3600;

export default async function Home() {
  const role = await getUserRole();
  const [categories, division, rawCategoryConfigs, allEquipment] = await Promise.all([
    getHomeCategories(role),
    getLocationDivision(),
    getCategoryConfigs(role),
    getEquipment(5000, role) // Fetch all to resolve cross-category image links
  ]);

  // Resolve missing images from Rentman for Sanity configs
  const categoryConfigs = rawCategoryConfigs?.map((config: any) => {
    if (!config.featuredProducts) return config;
    return {
      ...config,
      featuredProducts: config.featuredProducts.map((fp: any) => {
        if (!fp.imageUrl && fp.slug) {
          const rentmanProduct = allEquipment.find((p: any) => String(p.slug) === String(fp.slug) || String(p.id) === String(fp.slug));
          if (rentmanProduct?.image) {
            fp.imageUrl = rentmanProduct.image;
          }
        }
        return fp;
      })
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <LandingPage 
          categories={categories} 
          division={division} 
          categoryConfigs={categoryConfigs} 
        />
      </main>
      
      <Footer />
    </div>
  );
}
