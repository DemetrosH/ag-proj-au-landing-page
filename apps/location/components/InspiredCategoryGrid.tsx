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



export function InspiredCategoryGrid({ categories, configs = [], showTitle = true }: InspiredCategoryGridProps) {
  return (
    <section className="py-24 bg-white" id="inventory">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {showTitle && (
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-4">
                Explorez nos <span className="text-brand-orange">Catégories</span>
              </h2>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            
            // Find config by ID, slug, or normalized name match
            const config = configs.find(c => 
              c.rentmanId === category.id || 
              c.rentmanId === category.slug ||
              (c.title && c.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normalizedCatName)
            );
            
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
      </div>
    </section>
  );
}
