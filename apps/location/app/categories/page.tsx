import { getHomeCategories, getEquipment } from '../../lib/rentman';
import { getCategoryConfigs } from '../../lib/sanity';
import { getUserRole } from '../../lib/auth';
import { Header } from '../../components/Header';
import { CategoryCard } from '../../components/CategoryCard';

export const revalidate = 3600;

export default async function CategoriesPage() {
  const role = await getUserRole();
  const [categories, rawCategoryConfigs, allEquipment] = await Promise.all([
    getHomeCategories(role),
    getCategoryConfigs(role),
    getEquipment(5000, role)
  ]);

  // Resolve missing images from Rentman for Sanity configs (same logic as landing page)
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
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-24 md:py-32 max-w-7xl">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-6">
            Toutes nos <span className="text-brand-orange">catégories</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Parcourez notre catalogue complet d'équipements événementiels classés par expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => {
            const config = categoryConfigs.find((c: any) => c.rentmanId === category.id || c.rentmanId === category.slug);
            return (
              <CategoryCard 
                key={category.id} 
                category={category} 
                config={config} 
                index={index} 
              />
            );
          })}
        </div>
      </main>
      
      {/* Footer (Simplified for categories page) */}
      <footer className="bg-white border-t border-brand-border py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
            <div className="mb-6 md:mb-0">
              <span className="text-foreground font-bold tracking-tight">ARTÉFACT <span className="text-brand-gold">LOCATION</span></span>
            </div>
            <div className="flex space-x-10 uppercase tracking-widest text-[10px]">
              <a href="#" className="hover:text-brand-gold transition-colors">Conditions</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

