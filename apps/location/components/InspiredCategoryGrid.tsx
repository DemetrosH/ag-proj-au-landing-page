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

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
        {/* Neon Banner - Spans 2 rows on Desktop. Positioned after 4 items on mobile, 4th position on XL */}
        <div className="col-span-2 sm:col-span-1 xl:row-span-2 h-full order-5 xl:order-4 xl:col-span-1">
           <InspiredNeonBanner isVertical={true} />
        </div>

        {/* Render Categories */}
        {categories.map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || 
            c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );

          // Mobile: 
          // index 0,1,2,3 -> order 1,2,3,4
          // Banner -> order 5
          // index 4+ -> order 6+
          
          // XL (Desktop):
          // index 0,1,2 -> order 1,2,3 (AND span 2 rows to match banner height)
          // Banner -> order 4 (AND span 2 rows)
          // index 3+ -> order 5+ (standard 1 row, 4 per row)

          let specificOrder = "";
          let spanClass = "h-full";

          if (index < 3) {
            specificOrder = `order-${index + 1} xl:order-${index + 1}`;
            spanClass = "h-full xl:row-span-2"; // First 3 cards take 2 rows on XL
          } else if (index === 3) {
            specificOrder = "order-4 xl:order-5"; // Cat 4 is after banner on XL
          } else {
            specificOrder = `order-${index + 2} xl:order-${index + 2}`;
          }

          return (
            <div key={category.id} className={`${specificOrder} ${spanClass}`}>
              <CategoryCard category={category} config={config} index={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
