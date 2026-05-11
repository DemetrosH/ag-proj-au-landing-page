import React from 'react';
import Link from 'next/link';
import { Category } from '../lib/rentman';
import { NeonBanner } from './NeonBanner';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Filter out "Enseigne Néon" if it's in the data, to avoid duplicates
  // since we have a custom banner for it.
  const filteredCategories = categories.filter(c => 
    !c.name.toLowerCase().includes('néon') && !c.name.toLowerCase().includes('neon')
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px]">
        {/* Neon Banner - Spans 2 rows */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 row-span-2 h-full">
          <NeonBanner />
        </div>

        {/* Map other categories */}
        {filteredCategories.map((category, index) => {
          // Make some cards wider for the bento effect
          const isWide = index === 0 || index === 3 || index === 6; 
          const colSpanClass = isWide 
            ? 'col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2' 
            : 'col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';

          return (
            <Link 
              href={`/${category.slug}`} 
              key={category.id}
              className={`group relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors duration-500 block ${colSpanClass}`}
            >
              {/* If we have a preview image, use it as background */}
              {category.previewImages && category.previewImages.length > 0 && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700"
                    style={{ backgroundImage: `url(${category.previewImages[0]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
                </>
              )}
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{category.name}</h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex items-center gap-2">
                    <span className="text-gray-300 font-medium">Explorer l'inventaire</span>
                    <span className="text-gray-300">→</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
