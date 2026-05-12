'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Category } from '../lib/rentman';
import { CategoryConfig } from './LandingPage';
import { CategoryCard } from './CategoryCard';

interface InspiredCategoryGridProps {
  categories: Category[];
  configs?: CategoryConfig[];
  showTitle?: boolean;
}



import { InspiredNeonBanner } from './InspiredNeonBanner';

export function InspiredCategoryGrid({ categories, configs = [], showTitle = true }: InspiredCategoryGridProps) {
  // We want to inject the Neon Banner at index 3 (4th position)
  // to have it on the "side" in a 4-column grid.
  return (
    <div id="inventory">
      {showTitle && (
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-4 text-center lg:text-left">
              Explorez nos <span className="text-brand-orange">Catégories</span>
            </h2>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
        {/* Render first 3 categories */}
        {categories.slice(0, 3).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || 
            c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index} />;
        })}

        {/* Inject Neon Banner - Spans 2 rows on Desktop */}
        <div className="col-span-1 sm:row-span-2 h-full">
           <InspiredNeonBanner isVertical={true} />
        </div>

        {/* Render remaining categories */}
        {categories.slice(3).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || 
            c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index + 3} />;
        })}
      </div>
    </div>
  );
}
