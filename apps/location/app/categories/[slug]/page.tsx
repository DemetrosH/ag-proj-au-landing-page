import { getCategories, getProductsForCategory } from '../../../lib/rentman';
import { Header } from '../../../components/Header';
import Link from 'next/link';
import { getUserRole } from '../../../lib/auth';
import { URBA_ACCESS_RULES } from '../../../lib/access-control';
import { CategoryProductList } from './CategoryProductList';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = await getUserRole();
  const rules = URBA_ACCESS_RULES[role];

  // Protect hidden categories
  if (rules.hideCats.includes(slug)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Accès <span className="text-brand-orange">Restreint</span></h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-8">Connectez-vous avec un compte partenaire pour voir cet équipement.</p>
          <Link href="/login" className="bg-brand-dark text-white font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-brand-orange transition-all shadow-xl">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const categories = await getCategories();
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return <div>Catégorie non trouvée</div>;
  }

  const products = await getProductsForCategory(slug, role);

  // Sort products: Price Descending, then those without price at the end
  products.sort((a, b) => {
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    
    if (priceA === 0 && priceB > 0) return 1;
    if (priceB === 0 && priceA > 0) return -1;
    
    return priceB - priceA;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <Link href="/" className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-4 inline-block hover:underline">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{category.name}</h1>
          <div 
            className="text-xl text-gray-500 max-w-2xl leading-relaxed prose prose-brand max-w-none"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        </div>

        <CategoryProductList products={products} />
      </main>
    </div>
  );
}
