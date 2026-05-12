'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../lib/rentman';
import { CategoryConfig } from './LandingPage';

interface InspiredCategoryGridProps {
  categories: Category[];
  configs?: CategoryConfig[];
  showTitle?: boolean;
}

const borderColors = [
  "border-[#00AFEC]", // Cyan
  "border-[#E91E63]", // Magenta
  "border-[#F7A831]", // Orange
  "border-[#4CAF50]", // Green
  "border-[#9C27B0]", // Purple
];

const featuredProductKeywords: Record<string, string[]> = {
  "alimentaire": ["papa", "slush", "popcorn", "hot dog"],
  "chapiteaux": ["10x10", "mur", "photo", "poids"],
  "ameublements": ["table", "chaise", "tabouret", "mange"],
  "mobilier": ["table", "chaise", "tabouret", "mange"],
  "ameublement": ["table", "chaise", "tabouret", "mange"],
  "equipements electriques": ["passe", "rallonge", "panneau", "generatrice"],
  "sonorisation": ["qsc", "micro", "pied", "console"],
  "enseigne neon": ["tatou", "bonbon", "neon", "enseigne"],
  "video": ["tv", "ecran", "trepied", "projecteur"],
  "scene": ["praticable", "marche", "jupe", "garde"],
  "eclairage": ["led", "trepied", "lumiere", "dmx"],
  "signaletique": ["potelet", "corde", "chevalet", "panneau"],
  "jeux": ["hache", "cornhole", "geant", "puissance"],
  "blocs d'alimentation": ["ecoflow", "jackery", "batterie", "power"],
  "batteries": ["ecoflow", "jackery", "batterie", "power"],
  "poids": ["base", "pe30", "poids", "sable"],
  "supports": ["base", "pe30", "poids", "sable"]
};

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
            
            // 1. Content Overrides
            const displayTitle = config?.title || category.name;
            const displayDescription = config?.description || category.description || `Équipement professionnel de ${category.name.toLowerCase()} pour vos événements de toutes tailles.`;

            // 2. Featured Products Selection
            const availableProducts = [...(category.products || [])];
            const displayProducts: any[] = [];

            // A. Try Sanity featured products first
            if (config?.featuredProducts && config.featuredProducts.length > 0) {
              config.featuredProducts.forEach(fp => {
                if (displayProducts.length >= 4) return;
                
                const rentmanProduct = availableProducts.find(p => p.slug === fp.slug || p.id === fp.slug);
                displayProducts.push({
                  slug: fp.slug,
                  name: fp.name,
                  image: fp.imageUrl || rentmanProduct?.image || ''
                });

                // Remove from available so we don't duplicate
                if (rentmanProduct) {
                  const idx = availableProducts.indexOf(rentmanProduct);
                  if (idx > -1) availableProducts.splice(idx, 1);
                }
              });
            }

            // B. Fill with keywords if needed
            if (displayProducts.length < 4) {
              let keywords: string[] = [];
              for (const [key, kw] of Object.entries(featuredProductKeywords)) {
                const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                if (normalizedCatName.includes(normalizedKey) || normalizedKey.includes(normalizedCatName)) {
                  keywords = kw;
                  break;
                }
              }

              keywords.forEach((kw) => {
                if (displayProducts.length >= 4) return;
                const matchIndex = availableProducts.findIndex(p => 
                  p.name.toLowerCase().includes(kw) || 
                  p.slug.toLowerCase().includes(kw)
                );
                if (matchIndex !== -1) {
                  displayProducts.push(availableProducts[matchIndex]);
                  availableProducts.splice(matchIndex, 1);
                }
              });
            }

            // C. Fill remaining slots with whatever is left
            while (displayProducts.length < 4 && availableProducts.length > 0) {
              displayProducts.push(availableProducts.shift());
            }

            const borderColor = borderColors[index % borderColors.length];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className={`group bg-white border-t-8 ${borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 rounded-b-[2rem] overflow-hidden flex flex-col h-full`}
              >
                {/* 2x2 Product Thumbnail Grid */}
                <div className="grid grid-cols-2 bg-gray-50 aspect-square">
                  {[0, 1, 2, 3].map((i) => {
                    const product = displayProducts[i];

                    return (
                      <div key={i} className="relative border-[0.5px] border-gray-100 flex items-center justify-center p-6 overflow-hidden hover:bg-gray-100 hover:shadow-inner transition-all duration-300">
                        {product && product.image ? (
                          <Link href={`/products/${product.slug}`} className="relative w-full h-full block">
                            <Image 
                              src={product.image} 
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 768px) 50vw, 15vw"
                            />
                          </Link>
                        ) : (
                          <div className="text-gray-200 uppercase font-black text-[10px] tracking-widest text-center">
                            {displayTitle.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-2 group-hover:text-brand-orange transition-colors">
                    {displayTitle}
                  </h3>
                  
                  <p className="text-xs text-gray-500 font-medium mb-5 flex-grow line-clamp-2">
                    {displayDescription}
                  </p>
                  
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-brand-dark text-white font-bold uppercase tracking-widest text-[10px] hover:bg-brand-orange transition-colors group/btn"
                  >
                    <span>Voir la sélection</span>
                    <svg className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
