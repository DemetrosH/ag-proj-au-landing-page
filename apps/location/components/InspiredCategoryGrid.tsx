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

      {/* 
        To avoid Tailwind dynamic class issues and ensure exact placement:
        We use two separate grid containers for Mobile/Tablet vs Desktop.
      */}

      {/* --- DESKTOP VIEW (XL and up) --- */}
      <div className="hidden xl:grid grid-cols-4 gap-6 items-start">
        {/* First 3 categories on the left */}
        {categories.slice(0, 3).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index} />;
        })}

        {/* 4th position: Banner (takes 2 rows) */}
        <div className="row-span-2 h-full">
           <InspiredNeonBanner isVertical={true} />
        </div>

        {/* Remaining categories (fills the rest of row 2, then 4 per row from row 3 onwards) */}
        {categories.slice(3).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index + 3} />;
        })}
      </div>

      {/* --- MOBILE & TABLET VIEW (Below XL) --- */}
      <div className="grid xl:hidden grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* First 4 categories */}
        {categories.slice(0, 4).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index} />;
        })}

        {/* Banner: takes full width on its own row after 4 cards */}
        <div className="col-span-2 lg:col-span-3 h-full">
           {/* Forcing vertical to false on mobile ensures it looks good horizontally, 
               but we'll keep the prop true if that was the preferred style.
               Wait, previously `isVertical={true}` was used in both. We'll keep it true to match the aesthetic. */}
           <InspiredNeonBanner isVertical={true} />
        </div>

        {/* Remaining categories */}
        {categories.slice(4).map((category, index) => {
          const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const config = configs.find(c => 
            c.rentmanId === category.id || c.rentmanId === category.slug ||
            (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
          );
          return <CategoryCard key={category.id} category={category} config={config} index={index + 4} />;
        })}
      </div>
    </div>
  );
}
