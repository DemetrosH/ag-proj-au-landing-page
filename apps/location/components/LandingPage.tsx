'use client';

import React from 'react';
import { Category } from '../lib/rentman';
import { InspiredHero } from './InspiredHero';
import { InspiredCategoryGrid } from './InspiredCategoryGrid';
import { InspiredNeonBanner } from './InspiredNeonBanner';
import { SEOSection } from './SEOSection';

export interface CategoryConfig {
  rentmanId: string;
  title?: string;
  description?: string;
  featuredProducts?: {
    name: string;
    slug: string;
    imageUrl?: string;
  }[];
  order?: number;
}

export interface Division {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
}

interface LandingPageProps {
  categories: Category[];
  division?: Division;
  categoryConfigs?: CategoryConfig[];
}

export function LandingPage({ categories, division, categoryConfigs = [] }: LandingPageProps) {
  // Filter categories that have products and exclude specific ones
  const excludedCategories = ['communication', 'tapis'];
  let activeCategories = categories.filter(c => {
    const hasProducts = c.products && c.products.length > 0;
    const isExcluded = excludedCategories.some(term => 
      c.name.toLowerCase().includes(term) || 
      c.slug.toLowerCase().includes(term)
    );
    return hasProducts && !isExcluded;
  });

  // Apply sorting: Sanity order first, then legacy order
  activeCategories.sort((a, b) => {
    const configA = categoryConfigs.find(c => c.rentmanId === a.id || c.rentmanId === a.slug);
    const configB = categoryConfigs.find(c => c.rentmanId === b.id || c.rentmanId === b.slug);

    if (configA?.order !== undefined && configB?.order !== undefined) {
      return configA.order - configB.order;
    }
    if (configA?.order !== undefined) return -1;
    if (configB?.order !== undefined) return 1;

    // Legacy fallback order
    const categoryOrder = [
      "alimentaire",
      "chapiteaux",
      "ameublement",
      "mobilier",
      "equipements electriques",
      "sonorisation",
      "enseigne neon",
      "video",
      "scene",
      "eclairage",
      "signaletique",
      "jeux",
      "blocs d'alimentation",
      "batteries",
      "poids",
      "supports"
    ];

    const nameA = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const nameB = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    let indexA = categoryOrder.findIndex(key => nameA.includes(key) || key.includes(nameA));
    let indexB = categoryOrder.findIndex(key => nameB.includes(key) || key.includes(nameB));

    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;

    if (indexA === indexB) {
      return nameA.localeCompare(nameB);
    }

    return indexA - indexB;
  });

  // Split categories to insert the Neon Banner in the middle
  const middleIndex = Math.ceil(activeCategories.length / 2);
  const firstHalf = activeCategories.slice(0, middleIndex);
  const secondHalf = activeCategories.slice(middleIndex);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      
      {/* 1. Brand Inspired Hero */}
      <InspiredHero />

      {/* 2. Main Content Area */}
      <main className="bg-white">
        
        {/* First Half of Categories */}
        <InspiredCategoryGrid categories={firstHalf} configs={categoryConfigs} />

        {/* 3. Integrated Neon Banner Break */}
        <InspiredNeonBanner />

        {/* Second Half of Categories */}
        <InspiredCategoryGrid categories={secondHalf} configs={categoryConfigs} showTitle={false} />
        
        {activeCategories.length === 0 && (
          <div className="py-20 text-center text-gray-400 font-medium">
            Chargement de l'inventaire...
          </div>
        )}
      </main>

      {/* 4. SEO Optimization Content */}
      <SEOSection />

      {/* 5. Modern Mini Footer CTA */}
      <section className="py-24 bg-brand-gray/30 border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-brand-dark p-12 md:p-20 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
                Besoin d'un <br /><span className="text-brand-orange">Conseil ?</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-md font-medium">
                Nos experts sont disponibles pour vous accompagner dans la sélection technique de votre équipement.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-6">
               <a 
                href="/contact" 
                className="btn-orange text-sm uppercase tracking-widest px-12"
              >
                Contactez-nous
              </a>
              <a 
                href="tel:+14180000000" 
                className="flex items-center justify-center space-x-3 px-8 py-4 rounded-xl border-2 border-white/20 hover:bg-white/10 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                <span>Appeler</span>
              </a>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-orange/20 rounded-full blur-[120px]" />
          </div>
        </div>
      </section>
    </div>
  );
}
