import { getCategories, getProductsForCategory } from '../../../lib/rentman';
import { getCategoryConfigs } from '../../../lib/sanity';
import { Header } from '../../../components/Header';
import Link from 'next/link';
import { getUserRole } from '../../../lib/auth';
import { URBA_ACCESS_RULES } from '../../../lib/access-control';
import { CategoryProductList } from './CategoryProductList';
import { CategorySEOContent } from './CategorySEOContent';
import { NeonBanner } from './NeonBanner';
import { Footer } from '../../../components/Footer';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);

  if (!category) return { title: 'Catégorie non trouvée' };

  const title = category.seo_title || `Location ${category.name} Québec | Artéfact Urbain`;
  const description = category.seo_description || category.description?.substring(0, 160);
  const image = category.og_image;

  return {
    title,
    description,
    keywords: category.seo_keywords,
    alternates: {
      canonical: category.canonical_url,
    },
    robots: {
      index: !category.no_index,
      follow: !category.no_index,
    },
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      type: 'website',
    },
  };
}

// Force dynamic rendering as we use cookies for user roles
export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = await getUserRole();
  const rules = URBA_ACCESS_RULES[role];

  // Protect hidden categories
  if (rules.hideCats.includes(slug)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Accès <span className="text-brand-orange">Partenaire</span></h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Cet équipement est réservé à nos partenaires professionnels.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/login" className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-orange transition-all shadow-xl">
              Connexion Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return <div>Catégorie non trouvée</div>;
  }

  const [products, categoryConfigs] = await Promise.all([
    getProductsForCategory(slug, role),
    getCategoryConfigs(role)
  ]);

  const config = categoryConfigs?.find((c: any) => c.rentmanId === slug || c.rentmanId === category.id);

  // Sort products: orderedProducts first, then price descending fallback
  products.sort((a, b) => {
    if (config?.orderedProducts && config.orderedProducts.length > 0) {
      const orderedSlugs = config.orderedProducts.map((op: any) => op.slug);
      const indexA = orderedSlugs.indexOf(a.slug);
      const indexB = orderedSlugs.indexOf(b.slug);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
    }

    const priceA = a.price || 0;
    const priceB = b.price || 0;
    
    if (priceA === 0 && priceB > 0) return 1;
    if (priceB === 0 && priceA > 0) return -1;
    
    return priceB - priceA;
  });

  const displayTitle = slug === 'alimentaire' 
    ? "LOCATION D'ÉQUIPEMENT ALIMENTAIRE" 
    : slug === 'enseigne-neon' 
      ? "LOCATION D'ENSEIGNES NÉON" 
      : slug === 'scene'
        ? "LOCATION DE SCÈNE"
        : slug === 'bloc-dalimentation-batteries'
          ? "BLOCS D'ALIMENTATION & BATTERIES"
          : category.name;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[120rem] 5xl:max-w-[140rem]">
        <div className="mb-16">
          <Link href="/" className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-4 inline-block hover:underline">
            ← Retour à l'accueil
          </Link>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-8 relative inline-block">
              <span className="relative z-10">{displayTitle}</span>
              <span className="absolute bottom-1 left-0 w-16 h-1.5 bg-brand-orange z-0"></span>
            </h1>

            {slug === 'alimentaire' ? (
              <p className="text-xl text-gray-600 max-w-4xl leading-relaxed font-medium">
                Dynamisez vos événements avec notre service de <span className="font-black text-brand-dark underline decoration-brand-orange/30 decoration-4 underline-offset-4">location d'équipement alimentaire</span> professionnel. Que ce soit pour un festival, une fête d’entreprise ou un rassemblement privé, nous fournissons le matériel nécessaire pour créer des stations gourmandes mémorables et efficaces.
              </p>
            ) : slug === 'bloc-dalimentation-batteries' ? (
              <p className="text-xl text-gray-500 max-w-2xl leading-relaxed font-bold">
                Nos solutions d'alimentation portable
              </p>
            ) : (
              <div 
                className="text-xl text-gray-500 max-w-2xl leading-relaxed prose prose-brand max-w-none"
                dangerouslySetInnerHTML={{ __html: category.description }}
              />
            )}
            <CategorySEOContent slug={slug} />
            {slug === 'enseigne-neon' && <NeonBanner />}
          </div>
        </div>

        <CategoryProductList products={products} />
      </main>
      <Footer />
    </div>
  );
}
