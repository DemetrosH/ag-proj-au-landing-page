import { getHomeCategories, getEquipment } from '../../lib/rentman';
import { getCategoryConfigs } from '../../lib/sanity';
import { getUserRole } from '../../lib/auth';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CategoryFilterLayout } from '../../components/CategoryFilterLayout';

export const revalidate = 3600;

export default async function CategoriesPage() {
  const role = await getUserRole();
  const [categories, rawCategoryConfigs, allProducts] = await Promise.all([
    getHomeCategories(role),
    getCategoryConfigs(role),
    getEquipment(5000, role)
  ]);

  // Resolve missing images from Rentman for Sanity configs
  const categoryConfigs = rawCategoryConfigs?.map((config: any) => {
    if (!config.featuredProducts) return config;
    return {
      ...config,
      featuredProducts: config.featuredProducts.map((fp: any) => {
        if (!fp.imageUrl && fp.slug) {
          const rentmanProduct = allProducts.find((p: any) => p.slug === fp.slug || p.id === fp.slug);
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
      
      <main className="container mx-auto px-4 py-24 md:py-32 max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[120rem] 5xl:max-w-[140rem]">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tighter mb-6">
            Toutes nos <span className="text-brand-orange">catégories</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Parcourez notre catalogue complet d'équipements événementiels. Utilisez les filtres pour affiner votre sélection.
          </p>
        </div>

        <CategoryFilterLayout 
          categories={categories}
          allProducts={allProducts}
          categoryConfigs={categoryConfigs}
        />
      </main>
      
      <Footer />
    </div>
  );
}

