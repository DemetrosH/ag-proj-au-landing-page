import { Header } from '../components/Header';
import { LandingPage } from '../components/LandingPage';
import { getHomeCategories, getEquipment } from '../lib/rentman';
import { getLocationDivision, getCategoryConfigs } from '../lib/sanity';

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
          const rentmanProduct = allEquipment.find((p: any) => p.slug === fp.slug || p.id === fp.slug);
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
      
      {/* Festive Minimalist Footer */}
      <footer className="bg-white border-t border-brand-border py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
            <div className="mb-6 md:mb-0">
              <span className="text-foreground font-bold tracking-tight">ARTÉFACT <span className="text-brand-gold">LOCATION</span></span>
              <p className="mt-2 text-xs">Équipez vos événements de rêve.</p>
            </div>
            <div className="flex space-x-10 uppercase tracking-widest text-[10px]">
              <a href="#" className="hover:text-brand-gold transition-colors">Conditions</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-brand-border/30 text-center text-[10px] text-gray-300 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Artéfact Urbain - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
