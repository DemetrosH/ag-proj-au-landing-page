import { getCategories } from '../../lib/rentman';
import { Header } from '../../components/Header';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Toutes nos catégories</h1>
          <p className="text-xl text-gray-500">
            Parcourez notre catalogue complet d'équipements événementiels classés par expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group flex flex-col p-8 border border-brand-border rounded-[2.5rem] hover:border-brand-gold hover:shadow-xl transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center text-brand-gold mb-8 group-hover:bg-brand-gold group-hover:text-white transition-colors duration-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
              <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                {category.description}
              </p>
              <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-widest text-brand-gold">
                Explorer <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
